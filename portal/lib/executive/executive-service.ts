"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

export type OrganizationMember = {
  user_id: string;
  role: "coach" | "executive" | "admin";
  can_view_medical: boolean;
  can_view_documents: boolean;
  active: boolean;
  created_at: string;
};

export type ExecutiveRegistration = {
  id: string;
  status: string;
  season: string;
  submittedAt: string | null;
  familyName: string;
  parentName: string;
  parentEmail: string;
  playerName: string;
  dateOfBirth: string;
  releaseCount: number;
  birthCertificateStatus: string;
};

export async function loadCurrentMembership(): Promise<OrganizationMember> {
  const {
    data: { user },
    error: userError,
  } = await supabaseBrowser.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in to continue.");
  }

  const { data, error } = await supabaseBrowser
    .from("organization_members")
    .select("user_id, role, can_view_medical, can_view_documents, active, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.active || !["executive", "admin"].includes(data.role)) {
    throw new Error("Executive access has not been granted to this account.");
  }

  return data as OrganizationMember;
}

export async function loadOrganizationMembers(): Promise<OrganizationMember[]> {
  const { data, error } = await supabaseBrowser
    .from("organization_members")
    .select("user_id, role, can_view_medical, can_view_documents, active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OrganizationMember[];
}

export async function loadExecutiveRegistrations(): Promise<ExecutiveRegistration[]> {
  const { data: registrations, error: registrationError } = await supabaseBrowser
    .from("registrations")
    .select("id, family_id, player_id, status, season, submitted_at")
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (registrationError) {
    throw registrationError;
  }

  if (!registrations?.length) {
    return [];
  }

  const familyIds = Array.from(
    new Set(registrations.map((item) => item.family_id).filter(Boolean)),
  );
  const playerIds = Array.from(
    new Set(registrations.map((item) => item.player_id).filter(Boolean)),
  );

  const [
    { data: families, error: familyError },
    { data: players, error: playerError },
    { data: releases, error: releaseError },
    { data: documents, error: documentError },
  ] = await Promise.all([
    supabaseBrowser
      .from("families")
      .select("id, family_name, primary_parent_id")
      .in("id", familyIds),
    supabaseBrowser
      .from("players")
      .select("id, first_name, last_name, preferred_name, date_of_birth")
      .in("id", playerIds),
    supabaseBrowser
      .from("registration_release_acceptances")
      .select("registration_id, agreement_key"),
    supabaseBrowser
      .from("registration_documents")
      .select("registration_id, status, document_type")
      .eq("document_type", "birth_certificate")
      .neq("status", "replaced"),
  ]);

  if (familyError) throw familyError;
  if (playerError) throw playerError;
  if (releaseError) throw releaseError;
  if (documentError) throw documentError;

  const parentIds = Array.from(
    new Set((families ?? []).map((item) => item.primary_parent_id).filter(Boolean)),
  );

  const { data: profiles, error: profileError } = parentIds.length
    ? await supabaseBrowser
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", parentIds)
    : { data: [], error: null };

  if (profileError) {
    throw profileError;
  }

  return registrations.map((registration) => {
    const family = (families ?? []).find(
      (item) => item.id === registration.family_id,
    );
    const player = (players ?? []).find(
      (item) => item.id === registration.player_id,
    );
    const parent = (profiles ?? []).find(
      (item) => item.id === family?.primary_parent_id,
    );
    const releaseCount = new Set(
      (releases ?? [])
        .filter((item) => item.registration_id === registration.id)
        .map((item) => item.agreement_key),
    ).size;
    const document = (documents ?? []).find(
      (item) => item.registration_id === registration.id,
    );

    return {
      id: registration.id,
      status: registration.status,
      season: registration.season,
      submittedAt: registration.submitted_at,
      familyName: family?.family_name || "Unnamed family",
      parentName:
        [parent?.first_name, parent?.last_name].filter(Boolean).join(" ") ||
        "Not provided",
      parentEmail: parent?.email || "Not provided",
      playerName:
        player?.preferred_name ||
        [player?.first_name, player?.last_name].filter(Boolean).join(" ") ||
        "Player not saved",
      dateOfBirth: player?.date_of_birth || "Not provided",
      releaseCount,
      birthCertificateStatus: document?.status || "missing",
    };
  });
}

export async function grantOrganizationAccess({
  email,
  role,
  canViewMedical,
  canViewDocuments,
}: {
  email: string;
  role: "coach" | "executive" | "admin";
  canViewMedical: boolean;
  canViewDocuments: boolean;
}) {
  const { error } = await supabaseBrowser.rpc("grant_organization_access", {
    target_email: email,
    target_role: role,
    allow_medical: canViewMedical,
    allow_documents: role === "coach" ? false : canViewDocuments,
  });

  if (error) {
    throw error;
  }
}

export async function revokeOrganizationAccess(userId: string) {
  const { error } = await supabaseBrowser.rpc("revoke_organization_access", {
    target_user_id: userId,
  });

  if (error) {
    throw error;
  }
}
