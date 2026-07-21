"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export const REGISTRATION_DOCUMENT_BUCKET = "registration-documents";
export const MAX_REGISTRATION_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_REGISTRATION_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export type RegistrationContext = {
  userId: string;
  registrationId: string;
  playerId: string;
  playerName: string;
};

export type ReleaseAcceptance = {
  agreement_key: string;
  response: "accepted" | "declined";
  signature_name: string;
  signed_at: string;
};

export type RegistrationDocument = {
  id: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: "uploaded" | "verified" | "rejected" | "replaced";
  created_at: string;
};

export async function loadRegistrationContext(): Promise<RegistrationContext> {
  const {
    data: { user },
    error: userError,
  } = await supabaseBrowser.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in to continue.");
  }

  const { data: family, error: familyError } = await supabaseBrowser
    .from("families")
    .select("id")
    .eq("primary_parent_id", user.id)
    .maybeSingle();

  if (familyError) {
    throw familyError;
  }

  if (!family) {
    throw new Error("Complete the family registration before continuing.");
  }

  const { data: registration, error: registrationError } = await supabaseBrowser
    .from("registrations")
    .select("id, player_id, status, created_at")
    .eq("family_id", family.id)
    .in("status", ["draft", "submitted"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (registrationError) {
    throw registrationError;
  }

  if (!registration?.player_id) {
    throw new Error("Complete the player profile before continuing.");
  }

  const { data: player, error: playerError } = await supabaseBrowser
    .from("players")
    .select("first_name, preferred_name")
    .eq("id", registration.player_id)
    .single();

  if (playerError) {
    throw playerError;
  }

  return {
    userId: user.id,
    registrationId: registration.id,
    playerId: registration.player_id,
    playerName: player.preferred_name || player.first_name || "your athlete",
  };
}

export async function loadReleaseAcceptances(
  registrationId: string,
): Promise<ReleaseAcceptance[]> {
  const { data, error } = await supabaseBrowser
    .from("registration_release_acceptances")
    .select("agreement_key, response, signature_name, signed_at")
    .eq("registration_id", registrationId);

  if (error) {
    throw error;
  }

  return (data ?? []) as ReleaseAcceptance[];
}

export async function saveReleaseAcceptance({
  context,
  agreementKey,
  agreementVersion,
  agreementTitle,
  agreementSnapshot,
  response,
  signatureName,
}: {
  context: RegistrationContext;
  agreementKey: string;
  agreementVersion: string;
  agreementTitle: string;
  agreementSnapshot: string;
  response: "accepted" | "declined";
  signatureName: string;
}) {
  const { error } = await supabaseBrowser
    .from("registration_release_acceptances")
    .upsert(
      {
        registration_id: context.registrationId,
        player_id: context.playerId,
        signer_user_id: context.userId,
        agreement_key: agreementKey,
        agreement_version: agreementVersion,
        agreement_title: agreementTitle,
        agreement_snapshot: agreementSnapshot,
        response,
        accepted: true,
        signature_name: signatureName.trim(),
        signed_at: new Date().toISOString(),
        user_agent:
          typeof navigator === "undefined" ? null : navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "registration_id,agreement_key,agreement_version",
      },
    );

  if (error) {
    throw error;
  }
}

export async function loadBirthCertificates(
  registrationId: string,
): Promise<RegistrationDocument[]> {
  const { data, error } = await supabaseBrowser
    .from("registration_documents")
    .select("id, original_filename, content_type, size_bytes, status, created_at")
    .eq("registration_id", registrationId)
    .eq("document_type", "birth_certificate")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as RegistrationDocument[];
}

export async function loadBirthCertificate(
  registrationId: string,
): Promise<RegistrationDocument | null> {
  const { data, error } = await supabaseBrowser
    .from("registration_documents")
    .select("id, original_filename, content_type, size_bytes, status, created_at")
    .eq("registration_id", registrationId)
    .eq("document_type", "birth_certificate")
    .neq("status", "replaced")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as RegistrationDocument | null;
}

function extensionForFile(file: File) {
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  return "jpg";
}

export async function uploadBirthCertificate({
  context,
  file,
}: {
  context: RegistrationContext;
  file: File;
}): Promise<RegistrationDocument> {
  if (
    !ALLOWED_REGISTRATION_DOCUMENT_TYPES.includes(
      file.type as (typeof ALLOWED_REGISTRATION_DOCUMENT_TYPES)[number],
    )
  ) {
    throw new Error("Upload a JPG, PNG, or PDF file.");
  }

  if (file.size <= 0 || file.size > MAX_REGISTRATION_DOCUMENT_BYTES) {
    throw new Error("The file must be smaller than 10 MB.");
  }

  const extension = extensionForFile(file);
  const storagePath = [
    context.userId,
    context.registrationId,
    context.playerId,
    `birth-certificate-${Date.now()}.${extension}`,
  ].join("/");

  const { error: uploadError } = await supabaseBrowser.storage
    .from(REGISTRATION_DOCUMENT_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const now = new Date().toISOString();

  const { error: replaceError } = await supabaseBrowser
    .from("registration_documents")
    .update({
      status: "replaced",
      updated_at: now,
    })
    .eq("registration_id", context.registrationId)
    .eq("document_type", "birth_certificate")
    .in("status", ["uploaded", "verified", "rejected"]);

  if (replaceError) {
    await supabaseBrowser.storage
      .from(REGISTRATION_DOCUMENT_BUCKET)
      .remove([storagePath]);
    throw replaceError;
  }

  const { data, error: metadataError } = await supabaseBrowser
    .from("registration_documents")
    .insert({
      registration_id: context.registrationId,
      player_id: context.playerId,
      uploaded_by: context.userId,
      document_type: "birth_certificate",
      bucket_id: REGISTRATION_DOCUMENT_BUCKET,
      storage_path: storagePath,
      original_filename: file.name,
      content_type: file.type,
      size_bytes: file.size,
      status: "uploaded",
    })
    .select("id, original_filename, content_type, size_bytes, status, created_at")
    .single();

  if (metadataError) {
    await supabaseBrowser.storage
      .from(REGISTRATION_DOCUMENT_BUCKET)
      .remove([storagePath]);
    throw metadataError;
  }

  return data as RegistrationDocument;
}
