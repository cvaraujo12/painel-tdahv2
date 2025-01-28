import { createClient } from '@supabase/supabase-js'
import invariant from 'tiny-invariant'

// Verificação das variáveis de ambiente
invariant(process.env.SUPABASE_URL, 'SUPABASE_URL deve estar definida')
invariant(process.env.SUPABASE_ANON_KEY, 'SUPABASE_ANON_KEY deve estar definida')

export const supabase = createClient(
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
export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'in_progress' | 'completed'
  target_date?: string
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: string
  user_id: string
  start_time: string
  end_time?: string
  type: 'focus' | 'break'
  created_at: string
} 