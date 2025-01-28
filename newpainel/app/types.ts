export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
  priority: 'baixa' | 'média' | 'alta'
}

export interface Note {
  id: string
  content: string
  createdAt: string
}

export interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  completed: boolean
  createdAt: string
} 
