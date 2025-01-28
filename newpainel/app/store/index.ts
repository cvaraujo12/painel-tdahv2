import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '~/utils/supabase.client'

interface Task {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  user_id: string
  created_at: string
}

interface Note {
  id: string
  content: string
  user_id: string
  created_at: string
}

interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  completed: boolean
  user_id: string
  created_at: string
}

interface PomodoroSession {
  id: string
  duration: number
  type: 'focus' | 'break'
  user_id: string
  created_at: string
}

interface AppState {
  tasks: Task[]
  notes: Note[]
  goals: Goal[]
  pomodoros: PomodoroSession[]
  isLoading: boolean
  error: string | null
  
  // Ações
  fetchAllData: (userId: string) => Promise<void>
  addTask: (userId: string, task: Partial<Task>) => Promise<void>
  updateTask: (userId: string, taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (userId: string, taskId: string) => Promise<void>
  
  addNote: (userId: string, note: Partial<Note>) => Promise<void>
  updateNote: (userId: string, noteId: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (userId: string, noteId: string) => Promise<void>
  
  addGoal: (userId: string, goal: Partial<Goal>) => Promise<void>
  updateGoal: (userId: string, goalId: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (userId: string, goalId: string) => Promise<void>
  
  addPomodoro: (userId: string, pomodoro: Partial<PomodoroSession>) => Promise<void>
  updatePomodoro: (userId: string, pomodoroId: string, updates: Partial<PomodoroSession>) => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      notes: [],
      goals: [],
      pomodoros: [],
      isLoading: false,
      error: null,

      fetchAllData: async (userId: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const [tasks, notes, goals, pomodoros] = await Promise.all([
            supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('pomodoro_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
          ])

          if (tasks.error) throw tasks.error
          if (notes.error) throw notes.error
          if (goals.error) throw goals.error
          if (pomodoros.error) throw pomodoros.error

          set({
            tasks: tasks.data || [],
            notes: notes.data || [],
            goals: goals.data || [],
            pomodoros: pomodoros.data || [],
            isLoading: false
          })
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Erro ao buscar dados:', error)
        }
      },

      addTask: async (userId: string, task: Partial<Task>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('tasks')
            .insert([{ ...task, user_id: userId }])
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            tasks: [data, ...state.tasks],
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Erro ao adicionar tarefa:', error)
        }
      },

      updateTask: async (userId: string, taskId: string, updates: Partial<Task>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .eq('user_id', userId)
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === taskId ? data : t)),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Erro ao atualizar tarefa:', error)
        }
      },

      deleteTask: async (userId: string, taskId: string) => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)
            .eq('user_id', userId)

          if (error) throw error

          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== taskId),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Erro ao deletar tarefa:', error)
        }
      },

      // Funções para Notas
      addNote: async (userId: string, note: Partial<Note>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('notes')
            .insert([{ ...note, user_id: userId }])
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            notes: [data, ...state.notes],
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      updateNote: async (userId: string, noteId: string, updates: Partial<Note>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('notes')
            .update(updates)
            .eq('id', noteId)
            .eq('user_id', userId)
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            notes: state.notes.map((n) => (n.id === noteId ? data : n)),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      deleteNote: async (userId: string, noteId: string) => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', userId)

          if (error) throw error

          set((state) => ({
            notes: state.notes.filter((n) => n.id !== noteId),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      // Funções para Metas
      addGoal: async (userId: string, goal: Partial<Goal>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('goals')
            .insert([{ ...goal, user_id: userId }])
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            goals: [data, ...state.goals],
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      updateGoal: async (userId: string, goalId: string, updates: Partial<Goal>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('goals')
            .update(updates)
            .eq('id', goalId)
            .eq('user_id', userId)
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            goals: state.goals.map((g) => (g.id === goalId ? data : g)),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      deleteGoal: async (userId: string, goalId: string) => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', goalId)
            .eq('user_id', userId)

          if (error) throw error

          set((state) => ({
            goals: state.goals.filter((g) => g.id !== goalId),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      // Funções para Pomodoro
      addPomodoro: async (userId: string, pomodoro: Partial<PomodoroSession>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('pomodoro_sessions')
            .insert([{ ...pomodoro, user_id: userId }])
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            pomodoros: [data, ...state.pomodoros],
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      updatePomodoro: async (userId: string, pomodoroId: string, updates: Partial<PomodoroSession>) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('pomodoro_sessions')
            .update(updates)
            .eq('id', pomodoroId)
            .eq('user_id', userId)
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            pomodoros: state.pomodoros.map((p) => (p.id === pomodoroId ? data : p)),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      }
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        tasks: state.tasks,
        notes: state.notes,
        goals: state.goals,
        pomodoros: state.pomodoros
      })
    }
  )
) 