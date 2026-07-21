import { redirect } from "next/navigation";
import PlayerManager from "@/components/app/PlayerManager";
import { getFamilyDashboardData } from "@/lib/family/family-dashboard-service";
import { createSupabaseServer } from "@/lib/supabase-server";

export default async function TeamPage() {
  const s = await createSupabaseServer();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");

  const data = await getFamilyDashboardData(user.id, user.email ?? null);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-[#D7193F]">Family roster</p>
      <h1 className="mt-2 text-3xl font-black text-[#071D39]">My players</h1>
      <p className="mt-2 text-sm text-slate-500">
        Keep player information current or remove an unregistered duplicate.
      </p>
      {data.family ? (
        <PlayerManager familyId={data.family.id} players={data.players} />
      ) : (
        <div className="mt-5 rounded-2xl border bg-white p-5 text-sm text-slate-600">
          Complete the family step of registration before adding players.
        </div>
      )}
    </div>
  );
}
