import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'
import { init } from '~/config/env.server'

const env = init()

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
) 