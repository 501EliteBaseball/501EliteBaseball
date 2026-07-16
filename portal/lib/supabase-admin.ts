import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase-config";

export function createSupabaseAdmin() {
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Supabase server credentials are not configured.");
  }

  return createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
