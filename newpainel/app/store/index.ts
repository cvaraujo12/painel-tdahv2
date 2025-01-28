import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '~/utils/supabase.client'
import type { Task, Note, Goal, PomodoroSession } from '~/types'

interface AppState {
  // Tasks
  tasks: Task[]
  isLoadingTasks: boolean
  errorTasks: string | null
  addTask: (task: Task) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  
  // Notes
  notes: Note[]
  isLoadingNotes: boolean
  errorNotes: string | null
  addNote: (note: Note) => Promise<void>
  updateNote: (id: string, note: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  
  // Goals
  goals: Goal[]
  isLoadingGoals: boolean
  errorGoals: string | null
  addGoal: (goal: Goal) => Promise<void>
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleGoal: (id: string) => Promise<void>
  
  // Pomodoro
  pomodoros: PomodoroSession[]
  isLoadingPomodoros: boolean
  errorPomodoros: string | null
  addPomodoro: (pomodoro: PomodoroSession) => Promise<void>
  
  // Global
  fetchAllData: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Tasks
      tasks: [],
      isLoadingTasks: false,
      errorTasks: null,
      addTask: async (task) => {
        try {
          set({ isLoadingTasks: true, errorTasks: null })
          const { data, error } = await supabase
            .from('tasks')
            .insert([task])
            .select()
            .single()
          
          if (error) throw error
          
          set(state => ({
            tasks: [data, ...state.tasks],
            isLoadingTasks: false
          }))
        } catch (error) {
          set({ 
            errorTasks: error instanceof Error ? error.message : 'Erro ao adicionar tarefa',
            isLoadingTasks: false 
          })
        }
      },
      updateTask: async (id, task) => {
        try {
          set({ isLoadingTasks: true, errorTasks: null })
          const { data, error } = await supabase
            .from('tasks')
            .update(task)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          set(state => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, ...data } : t),
            isLoadingTasks: false
          }))
        } catch (error) {
          set({ 
            errorTasks: error instanceof Error ? error.message : 'Erro ao atualizar tarefa',
            isLoadingTasks: false 
          })
        }
      },
      deleteTask: async (id) => {
        try {
          set({ isLoadingTasks: true, errorTasks: null })
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          
          set(state => ({
            tasks: state.tasks.filter(t => t.id !== id),
            isLoadingTasks: false
          }))
        } catch (error) {
          set({ 
            errorTasks: error instanceof Error ? error.message : 'Erro ao excluir tarefa',
            isLoadingTasks: false 
          })
        }
      },
      toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id)
        if (!task) return
        
        await get().updateTask(id, {
          status: task.status === 'completed' ? 'pending' : 'completed'
        })
      },
      
      // Notes
      notes: [],
      isLoadingNotes: false,
      errorNotes: null,
      addNote: async (note) => {
        try {
          set({ isLoadingNotes: true, errorNotes: null })
          const { data, error } = await supabase
            .from('notes')
            .insert([note])
            .select()
            .single()
          
          if (error) throw error
          
          set(state => ({
            notes: [data, ...state.notes],
            isLoadingNotes: false
          }))
        } catch (error) {
          set({ 
            errorNotes: error instanceof Error ? error.message : 'Erro ao adicionar nota',
            isLoadingNotes: false 
          })
        }
      },
      updateNote: async (id, note) => {
        try {
          set({ isLoadingNotes: true, errorNotes: null })
          const { data, error } = await supabase
            .from('notes')
            .update(note)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          set(state => ({
            notes: state.notes.map(n => n.id === id ? { ...n, ...data } : n),
            isLoadingNotes: false
          }))
        } catch (error) {
          set({ 
            errorNotes: error instanceof Error ? error.message : 'Erro ao atualizar nota',
            isLoadingNotes: false 
          })
        }
      },
      deleteNote: async (id) => {
        try {
          set({ isLoadingNotes: true, errorNotes: null })
          const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          
          set(state => ({
            notes: state.notes.filter(n => n.id !== id),
            isLoadingNotes: false
          }))
        } catch (error) {
          set({ 
            errorNotes: error instanceof Error ? error.message : 'Erro ao excluir nota',
            isLoadingNotes: false 
          })
        }
      },
      
      // Goals
      goals: [],
      isLoadingGoals: false,
      errorGoals: null,
      addGoal: async (goal) => {
        try {
          set({ isLoadingGoals: true, errorGoals: null })
          const { data, error } = await supabase
            .from('goals')
            .insert([goal])
            .select()
            .single()
          
          if (error) throw error
          
          set(state => ({
            goals: [data, ...state.goals],
            isLoadingGoals: false
          }))
        } catch (error) {
          set({ 
            errorGoals: error instanceof Error ? error.message : 'Erro ao adicionar meta',
            isLoadingGoals: false 
          })
        }
      },
      updateGoal: async (id, goal) => {
        try {
          set({ isLoadingGoals: true, errorGoals: null })
          const { data, error } = await supabase
            .from('goals')
            .update(goal)
            .eq('id', id)
            .select()
            .single()
          
          if (error) throw error
          
          set(state => ({
            goals: state.goals.map(g => g.id === id ? { ...g, ...data } : g),
            isLoadingGoals: false
          }))
        } catch (error) {
          set({ 
            errorGoals: error instanceof Error ? error.message : 'Erro ao atualizar meta',
            isLoadingGoals: false 
          })
        }
      },
      deleteGoal: async (id) => {
        try {
          set({ isLoadingGoals: true, errorGoals: null })
          const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id)
          
          if (error) throw error
          
          set(state => ({
            goals: state.goals.filter(g => g.id !== id),
            isLoadingGoals: false
          }))
        } catch (error) {
          set({ 
            errorGoals: error instanceof Error ? error.message : 'Erro ao excluir meta',
            isLoadingGoals: false 
          })
        }
      },
      toggleGoal: async (id) => {
        const goal = get().goals.find(g => g.id === id)
        if (!goal) return
        
        await get().updateGoal(id, {
          completed: !goal.completed
        })
      },
      
      // Pomodoro
      pomodoros: [],
      isLoadingPomodoros: false,
      errorPomodoros: null,
      addPomodoro: async (pomodoro) => {
        try {
          set({ isLoadingPomodoros: true, errorPomodoros: null })
          const { data, error } = await supabase
            .from('pomodoro_sessions')
            .insert([pomodoro])
            .select()
            .single()
          
          if (error) throw error
          
          set(state => ({
            pomodoros: [data, ...state.pomodoros],
            isLoadingPomodoros: false
          }))
        } catch (error) {
          set({ 
            errorPomodoros: error instanceof Error ? error.message : 'Erro ao adicionar pomodoro',
            isLoadingPomodoros: false 
          })
        }
      },
      
      // Global
      fetchAllData: async () => {
        try {
          const user = supabase.auth.getUser()
          if (!user) return
          
          const [tasks, notes, goals, pomodoros] = await Promise.all([
            supabase
              .from('tasks')
              .select('*')
              .order('created_at', { ascending: false }),
            supabase
              .from('notes')
              .select('*')
              .order('created_at', { ascending: false }),
            supabase
              .from('goals')
              .select('*')
              .order('created_at', { ascending: false }),
            supabase
              .from('pomodoro_sessions')
              .select('*')
              .order('created_at', { ascending: false })
          ])
          
          set({
            tasks: tasks.data || [],
            notes: notes.data || [],
            goals: goals.data || [],
            pomodoros: pomodoros.data || [],
            isLoadingTasks: false,
            isLoadingNotes: false,
            isLoadingGoals: false,
            isLoadingPomodoros: false,
            errorTasks: null,
            errorNotes: null,
            errorGoals: null,
            errorPomodoros: null
          })
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
        }
      }
    }),
    {
      name: 'app-store',
      skipHydration: true
    }
  )
) 