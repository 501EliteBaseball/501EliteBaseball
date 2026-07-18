import { NextResponse } from "next/server";
import { requireAccountingStaff } from "@/lib/accounting/require-accounting-staff";

export async function POST(request: Request) {
  const auth = await requireAccountingStaff(request);
  if (!auth) return NextResponse.json({ error: "Executive access required." }, { status: 403 });
  const body = await request.json();
  const cents = Math.round(Number(body.amount) * 100);
  if (!body.description?.trim() || !Number.isInteger(cents) || cents <= 0) return NextResponse.json({ error: "Description and a valid amount are required." }, { status: 400 });
  let query = auth.client.from("family_accounts").select("id").eq("status", "active");
  if (body.family_id) query = query.eq("family_id", body.family_id);
  const { data: accounts, error: accountError } = await query;
  if (accountError || !accounts?.length) return NextResponse.json({ error: accountError?.message ?? "No matching family accounts." }, { status: 400 });
  const rows = accounts.map(account => ({ account_id: account.id, category: body.category || "team_fee", description: String(body.description).trim().slice(0, 160), amount_cents: cents, due_date: body.due_date || null, notes: String(body.notes || "").slice(0, 1000), created_by: auth.user.id }));
  const { error } = await auth.client.from("account_charges").insert(rows);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ created: rows.length });
}
