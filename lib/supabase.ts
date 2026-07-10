import { createClient } from '@supabase/supabase-js'

function cleanUrl(url: string) {
  return url.replace(/\/(rest|auth|storage)\/v1\/?$/, '').replace(/\/+$/, '')
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  return createClient(cleanUrl(url), anonKey, {
    auth: { persistSession: false },
  })
}
