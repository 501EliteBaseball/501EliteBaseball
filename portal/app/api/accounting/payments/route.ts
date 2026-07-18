import { NextResponse } from "next/server";
import { requireAccountingStaff } from "@/lib/accounting/require-accounting-staff";

export async function POST(request: Request) {
  const auth = await requireAccountingStaff(request);
  if (!auth) return NextResponse.json({ error: "Executive access required." }, { status: 403 });
  const body = await request.json();
  const cents = Math.round(Number(body.amount) * 100);
  if (!body.account_id || !Number.isInteger(cents) || cents <= 0) return NextResponse.json({ error: "Account and a valid amount are required." }, { status: 400 });
  const row = { account_id: body.account_id, amount_cents: cents, paid_at: body.paid_at ? new Date(body.paid_at).toISOString() : new Date().toISOString(), method: body.method || "other", reference: String(body.reference || "").slice(0, 120), notes: String(body.notes || "").slice(0, 1000), created_by: auth.user.id };
  const { error } = await auth.client.from("account_payments").insert(row);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
