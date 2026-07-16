const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!rawSupabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

function normalizeSupabaseUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.origin;
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL");
  }
}

export const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

const rawPublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawPublishableKey) {
  throw new Error("Missing Supabase publishable key");
}

export const supabasePublishableKey = rawPublishableKey;
