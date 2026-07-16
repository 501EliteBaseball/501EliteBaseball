import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function requireExecutive(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  const supabase = accessToken
    ? createClient(supabaseUrl, supabasePublishableKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : await createSupabaseServer();
  const { data: { user }, error: userError } = accessToken
    ? await supabase.auth.getUser(accessToken)
    : await supabase.auth.getUser();

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
