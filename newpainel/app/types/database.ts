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
          user_id: string
          title: string
          description?: string
          status: 'pending' | 'completed'
          priority: 'low' | 'medium' | 'high'
          due_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string
          status?: 'pending' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string
        }
        Update: {
          title?: string
          description?: string
          status?: 'pending' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          content: string
        }
        Update: {
          content?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          status: 'in_progress' | 'completed'
          target_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string
          status?: 'in_progress' | 'completed'
          target_date?: string
        }
        Update: {
          title?: string
          description?: string
          status?: 'in_progress' | 'completed'
          target_date?: string
          updated_at?: string
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time?: string
          type: 'focus' | 'break'
          created_at: string
        }
        Insert: {
          user_id: string
          start_time: string
          type: 'focus' | 'break'
          end_time?: string
        }
        Update: {
          end_time?: string
        }
      }
    }
  }
} 