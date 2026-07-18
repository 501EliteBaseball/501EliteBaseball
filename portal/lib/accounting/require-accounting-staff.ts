import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";

export async function requireAccountingStaff(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/, "") ?? "";
  const client = createClient(supabaseUrl, supabasePublishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false },
  });
  const { data: { user } } = await client.auth.getUser(token);
  if (!user) return null;
  const { data: member } = await client.from("organization_members").select("role,active").eq("user_id", user.id).maybeSingle();
  return member?.active && ["executive", "admin"].includes(member.role) ? { client, user } : null;
}
