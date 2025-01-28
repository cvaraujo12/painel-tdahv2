export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          completed?: boolean
          priority: 'low' | 'medium' | 'high'
          user_id: string
        }
        Update: {
          title?: string
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
        }
      }
      notes: {
        Row: {
          id: string
          content: string
          color: 'yellow' | 'blue' | 'green' | 'purple' | 'red'
          is_important: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          content: string
          color: 'yellow' | 'blue' | 'green' | 'purple' | 'red'
          is_important?: boolean
          user_id: string
        }
        Update: {
          content?: string
          color?: 'yellow' | 'blue' | 'green' | 'purple' | 'red'
          is_important?: boolean
        }
      }
      goals: {
        Row: {
          id: string
          title: string
          completed: boolean
          progress: number
          period: 'daily' | 'weekly' | 'monthly'
          category: 'saude' | 'trabalho' | 'pessoal' | 'aprendizado'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          completed?: boolean
          progress?: number
          period: 'daily' | 'weekly' | 'monthly'
          category: 'saude' | 'trabalho' | 'pessoal' | 'aprendizado'
          user_id: string
        }
        Update: {
          title?: string
          completed?: boolean
          progress?: number
          period?: 'daily' | 'weekly' | 'monthly'
          category?: 'saude' | 'trabalho' | 'pessoal' | 'aprendizado'
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          duration: number
          completed: boolean
          user_id: string
          created_at: string
        }
        Insert: {
          duration: number
          completed?: boolean
          user_id: string
        }
        Update: {
          completed?: boolean
        }
      }
    }
  }
} 