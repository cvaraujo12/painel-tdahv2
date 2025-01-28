import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Task, Note, Goal } from './types'
import { supabase } from './utils/supabase.client'

interface Store {
  tasks: Task[]
  notes: Note[]
  goals: Goal[]
  isLoading: boolean
  error: string | null
  addTask: (task: Task) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  editTask: (id: string, task: Partial<Task>) => Promise<void>
  addNote: (note: Note) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  editNote: (id: string, note: Partial<Note>) => Promise<void>
  addGoal: (goal: Goal) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleGoal: (id: string) => Promise<void>
  editGoal: (id: string, goal: Partial<Goal>) => Promise<void>
  clearAllData: () => Promise<void>
  clearTasks: () => Promise<void>
  clearNotes: () => Promise<void>
  clearGoals: () => Promise<void>
  syncWithSupabase: () => Promise<void>
}

const STORAGE_KEY = 'tdah-store'
const VERSION = '1.0.0'

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      tasks: [],
      notes: [],
      goals: [],
      isLoading: false,
      error: null,

      syncWithSupabase: async () => {
        try {
          set({ isLoading: true, error: null })
          
          // Buscar dados do Supabase
          const [tasksResponse, notesResponse, goalsResponse] = await Promise.all([
            supabase.from('tasks').select('*').order('created_at', { ascending: false }),
            supabase.from('notes').select('*').order('created_at', { ascending: false }),
            supabase.from('goals').select('*').order('created_at', { ascending: false })
          ])

          if (tasksResponse.error) throw tasksResponse.error
          if (notesResponse.error) throw notesResponse.error
          if (goalsResponse.error) throw goalsResponse.error

          set({
            tasks: tasksResponse.data || [],
            notes: notesResponse.data || [],
            goals: goalsResponse.data || [],
            isLoading: false
          })
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      addTask: async (task) => {
        try {
          set({ isLoading: true, error: null })
          const { data, error } = await supabase
            .from('tasks')
            .insert([task])
            .select()
            .single()

          if (error) throw error

          set((state) => ({
            tasks: [data, ...state.tasks].slice(0, 100),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      deleteTask: async (id) => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

          if (error) throw error

          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      toggleTask: async (id) => {
        try {
          set({ isLoading: true, error: null })
          const task = get().tasks.find((t) => t.id === id)
          if (!task) throw new Error('Tarefa não encontrada')

          const { error } = await supabase
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', id)

          if (error) throw error

          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, completed: !t.completed } : t
            ),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      editTask: async (id, updatedTask) => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase
            .from('tasks')
            .update(updatedTask)
            .eq('id', id)

          if (error) throw error

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            ),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      addNote: (note) =>
        set((state) => ({
          notes: [note, ...state.notes].slice(0, 50), // Limita a 50 notas
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      editNote: (id, updatedNote) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updatedNote } : note
          ),
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [goal, ...state.goals].slice(0, 20), // Limita a 20 metas
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),

      toggleGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, completed: !goal.completed } : goal
          ),
        })),

      editGoal: (id, updatedGoal) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updatedGoal } : goal
          ),
        })),

      clearAllData: async () => {
        try {
          set({ isLoading: true, error: null })
          await Promise.all([
            supabase.from('tasks').delete().neq('id', '0'),
            supabase.from('notes').delete().neq('id', '0'),
            supabase.from('goals').delete().neq('id', '0')
          ])
          set({ tasks: [], notes: [], goals: [], isLoading: false })
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      clearTasks: async () => {
        try {
          set({ isLoading: true, error: null })
          const { error } = await supabase.from('tasks').delete().neq('id', '0')
          if (error) throw error
          set((state) => ({ ...state, tasks: [], isLoading: false }))
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },

      clearNotes: () => set((state) => ({ ...state, notes: [] })),
      clearGoals: () => set((state) => ({ ...state, goals: [] })),
    }),
    {
      name: STORAGE_KEY,
      version: VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        notes: state.notes,
        goals: state.goals,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.syncWithSupabase()
        }
      },
    }
  )
) 
