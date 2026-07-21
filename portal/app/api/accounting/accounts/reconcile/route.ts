import { NextResponse } from "next/server";
import { requireAccountingStaff } from "@/lib/accounting/require-accounting-staff";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const ROSTER_SURNAMES = [
  "Dawson",
  "Grimmett",
  "Brown",
  "Scott",
  "Wiley",
  "Frechette",
  "Thomas",
  "Chambers",
  "George",
  "Gillespie",
  "Willingham",
  "Mills",
  "French",
] as const;

const normalized = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");

export async function POST(request: Request) {
  const auth = await requireAccountingStaff(request);
  if (!auth) return NextResponse.json({ error: "Executive access required." }, { status: 403 });

  const admin = createSupabaseAdmin();
  const [playersResult, registrationsResult, accountsResult] = await Promise.all([
    admin.from("players").select("id,last_name"),
    admin.from("registrations").select("id,player_id,family_id,created_at").order("created_at", { ascending: false }),
    admin.from("family_accounts").select("id,family_id,account_number,display_name"),
  ]);

  const readError = playersResult.error || registrationsResult.error || accountsResult.error;
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const players = playersResult.data ?? [];
  const registrations = registrationsResult.data ?? [];
  const accounts = accountsResult.data ?? [];
  const created: string[] = [];
  const corrected: string[] = [];
  const unchanged: string[] = [];

  for (const surname of ROSTER_SURNAMES) {
    const displayName = `${surname} Family`;
    const playerIds = players
      .filter((player) => normalized(player.last_name ?? "") === normalized(surname))
      .map((player) => player.id);
    const registration = registrations.find((row) => playerIds.includes(row.player_id));
    const linkedAccount = registration?.family_id
      ? accounts.find((account) => account.family_id === registration.family_id)
      : undefined;
    const namedAccount = accounts.find(
      (account) => normalized(account.display_name ?? "").replace(/family$/, "") === normalized(surname),
    );
    const account = linkedAccount ?? namedAccount;

    if (account) {
      if (account.display_name !== displayName) {
        const { error } = await admin
          .from("family_accounts")
          .update({ display_name: displayName, updated_at: new Date().toISOString() })
          .eq("id", account.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        corrected.push(displayName);
      } else {
        unchanged.push(displayName);
      }

      continue;
    }

    const { error } = await admin.from("family_accounts").insert({
      family_id: registration?.family_id ?? null,
      display_name: displayName,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    created.push(displayName);
  }

  return NextResponse.json({
    ok: true,
    rosterCount: ROSTER_SURNAMES.length,
    created,
    corrected,
    unchanged,
  });
}
