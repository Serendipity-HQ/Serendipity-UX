"use client";

import { createBrowserSupabaseClient } from "./supabase";

export async function authHeaders(): Promise<HeadersInit> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return {};

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function authedFetch(path: string, init: RequestInit = {}) {
  const headers = await authHeaders();
  return fetch(path, {
    ...init,
    headers: {
      ...headers,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
}
