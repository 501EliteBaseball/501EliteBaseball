import { createSupabaseAdmin } from "@/lib/supabase-admin";

type Document = { bucket_id: string; storage_path: string };
type DeleteResult = {
  deleted: boolean;
  family_removed: boolean;
  player_removed: boolean;
};

async function removeDocuments(documents: Document[]) {
  const admin = createSupabaseAdmin();
  const buckets = new Map<string, Document[]>();

  for (const document of documents) {
    const items = buckets.get(document.bucket_id) ?? [];
    items.push(document);
    buckets.set(document.bucket_id, items);
  }

  for (const [bucket, items] of buckets) {
    const paths = items.map((item) => item.storage_path);
    const { error } = await admin.storage.from(bucket).remove(paths);
    if (error) throw new Error(`Storage cleanup failed: ${error.message}`);
  }
}

export async function deleteRegistration(id: string, actorUserId: string) {
  const admin = createSupabaseAdmin();
  const { data: registration, error: registrationError } = await admin
    .from("registrations")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (registrationError) throw registrationError;
  if (!registration) return null;

  const { data: documents, error: documentError } = await admin
    .from("registration_documents")
    .select("bucket_id, storage_path")
    .eq("registration_id", id);

  if (documentError) throw documentError;
  await removeDocuments(documents ?? []);

  const { data, error: deleteError } = await admin.rpc(
    "delete_registration_cascade",
    { registration_id: id, actor_user_id: actorUserId },
  );

  if (deleteError) throw deleteError;
  const result = data as DeleteResult;
  return {
    familyRemoved: result.family_removed,
    playerRemoved: result.player_removed,
  };
}
