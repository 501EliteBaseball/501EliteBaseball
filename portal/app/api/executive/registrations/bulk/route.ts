import { NextResponse } from "next/server";
import { deleteRegistration } from "@/lib/executive/delete-registration";
import { requireExecutive } from "@/lib/executive/require-executive";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type BulkRequest = { action?: "archive" | "restore" | "delete"; registrationIds?: unknown };

function readIds(value: unknown) {
  if (!Array.isArray(value)) return null;
  const ids = [...new Set(value.filter((id): id is string => typeof id === "string"))];
  return ids.length > 0 && ids.length <= 100 && ids.every((id) => UUID_PATTERN.test(id))
    ? ids
    : null;
}

async function archive(ids: string[], actorUserId: string) {
  const { data, error } = await createSupabaseAdmin().rpc(
    "archive_registrations",
    { registration_ids: ids, actor_user_id: actorUserId },
  );
  if (error) throw error;
  return data;
}

async function restore(ids: string[]) {
  const { data, error } = await createSupabaseAdmin()
    .from("registrations")
    .update({ archived_at: null, archived_by: null })
    .in("id", ids)
    .not("archived_at", "is", null)
    .select("id");
  if (error) throw error;
  return { affected_count: data?.length ?? 0 };
}

async function remove(ids: string[], actorUserId: string) {
  const results = [];
  for (const id of ids) {
    const result = await deleteRegistration(id, actorUserId);
    results.push({ id, deleted: Boolean(result), ...result });
  }
  return { affected_count: results.filter((result) => result.deleted).length, results };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const authorization = await requireExecutive(request);
  if ("error" in authorization) {
    return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  }

  let body: BulkRequest;
  try {
    body = await request.json() as BulkRequest;
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  const ids = readIds(body.registrationIds);
  if (!ids || !["archive", "restore", "delete"].includes(body.action ?? "")) {
    return NextResponse.json({ error: "Choose an action and 1–100 valid registrations." }, { status: 400 });
  }

  try {
    const result = body.action === "archive"
      ? await archive(ids, authorization.user.id)
      : body.action === "restore"
        ? await restore(ids)
        : await remove(ids, authorization.user.id);
    return NextResponse.json({ ok: true, action: body.action, ...result });
  } catch (error) {
    console.error("Bulk registration action failed", { action: body.action, ids, error });
    return NextResponse.json({ error: "The bulk action could not be completed." }, { status: 500 });
  }
}
