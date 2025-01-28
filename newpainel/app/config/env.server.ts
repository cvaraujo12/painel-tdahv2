import invariant from 'tiny-invariant'

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue
  invariant(value, `${key} is required`)
  return value
}

export function init() {
  const SUPABASE_URL = getEnvVar('SUPABASE_URL')
  const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY')
  const SESSION_SECRET = getEnvVar('SESSION_SECRET')

  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SESSION_SECRET,
  }
} 