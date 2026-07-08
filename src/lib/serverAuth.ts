import { createClient } from "@supabase/supabase-js";

function cleanUrl(url: string) {
  return url.replace(/\/(rest|auth|storage)\/v1\/?$/, "").replace(/\/+$/, "");
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return null;
  return createClient(cleanUrl(url), serviceRole, { auth: { persistSession: false } });
}

export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(cleanUrl(url), anon, { auth: { persistSession: false } });
}

export async function getUserFromRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!url || !anon || !token) return { user: null, token: null };

  const supabase = createClient(cleanUrl(url), anon, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { user: null, token: null };

  return { user: data.user, token };
}

export async function getProfileForUser(userId: string) {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data ?? null;
}

export async function requireUser(request: Request) {
  const { user } = await getUserFromRequest(request);
  return user;
}

export async function requireAdmin(request: Request) {
  const { user } = await getUserFromRequest(request);
  if (!user) return null;

  const profile = await getProfileForUser(user.id);
  return profile?.is_admin ? { user, profile } : null;
}
