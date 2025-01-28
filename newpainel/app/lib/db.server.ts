import { supabase } from './supabase.server'
import type { Task, Note, Goal, PomodoroSession } from './supabase.server'

// Tasks
export async function getTasks(userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Task[]
}

export async function createTask(userId: string, task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: userId }])
    .select()

  if (error) throw error
  return data[0] as Task
}

export async function updateTask(taskId: string, userId: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()

  if (error) throw error
  return data[0] as Task
}

// Notes
export async function getNotes(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Note[]
}

export async function createNote(userId: string, note: Partial<Note>) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ ...note, user_id: userId }])
    .select()

  if (error) throw error
  return data[0] as Note
}

// Goals
export async function getGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Goal[]
}

export async function createGoal(userId: string, goal: Partial<Goal>) {
  const { data, error } = await supabase
    .from('goals')
    .insert([{ ...goal, user_id: userId }])
    .select()

  if (error) throw error
  return data[0] as Goal
}

export async function updateGoal(goalId: string, userId: string, updates: Partial<Goal>) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()

  if (error) throw error
  return data[0] as Goal
}

// Pomodoro Sessions
export async function createPomodoroSession(userId: string, session: Partial<PomodoroSession>) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert([{ ...session, user_id: userId }])
    .select()

  if (error) throw error
  return data[0] as PomodoroSession
}

export async function updatePomodoroSession(sessionId: string, userId: string, updates: Partial<PomodoroSession>) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .update(updates)
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select()

  if (error) throw error
  return data[0] as PomodoroSession
}

export async function getPomodoroStats(userId: string) {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return data as PomodoroSession[]
} 