export interface Task {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  user_id: string
  created_at: string
}

export interface Note {
  id: string
  content: string
  user_id: string
  created_at: string
}

export interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  completed: boolean
  user_id: string
  created_at: string
}

export interface PomodoroSession {
  id: string
  duration: number
  type: 'focus' | 'break'
  user_id: string
  created_at: string
}

export interface User {
  id: string
  email: string
} 