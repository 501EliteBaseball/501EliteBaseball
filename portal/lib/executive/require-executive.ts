import { createSupabaseServer } from "@/lib/supabase-server";

export async function requireExecutive() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Authentication required.", status: 401 } as const;
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    membershipError ||
    !membership?.active ||
    !["executive", "admin"].includes(membership.role)
  ) {
    return { error: "Executive or administrator access is required.", status: 403 } as const;
  }

  return { user } as const;
}
