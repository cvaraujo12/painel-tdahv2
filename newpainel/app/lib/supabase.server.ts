import { createClient } from '@supabase/supabase-js'
import invariant from 'tiny-invariant'
import type { Database } from '~/types/database'

// Verificação das variáveis de ambiente
invariant(process.env.SUPABASE_URL, 'SUPABASE_URL deve estar definida')
invariant(process.env.SUPABASE_ANON_KEY, 'SUPABASE_ANON_KEY deve estar definida')

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Tipos para as tabelas do banco de dados
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']

export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']

export type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row']
export type PomodoroSessionInsert = Database['public']['Tables']['pomodoro_sessions']['Insert']
export type PomodoroSessionUpdate = Database['public']['Tables']['pomodoro_sessions']['Update'] 