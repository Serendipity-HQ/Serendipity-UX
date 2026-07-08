import { createClient } from "@supabase/supabase-js";

function cleanUrl(url: string) {
  return url.replace(/\/(rest|auth|storage)\/v1\/?$/, "").replace(/\/+$/, "");
}

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceRole ?? anon;

  if (!url || !key) {
    return null;
  }

  return createClient(cleanUrl(url), key, {
    auth: { persistSession: false },
  });
}
