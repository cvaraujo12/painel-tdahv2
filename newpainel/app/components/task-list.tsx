'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']
type Category = 'trabalho' | 'pessoal' | 'saude' | 'outros'

const MAX_VISIBLE_TASKS = 5 // Limite de tarefas visíveis por vez
const CATEGORIES: Category[] = ['trabalho', 'pessoal', 'saude', 'outros']

const getCategoryColor = (category: Category) => {
  const colors = {
    trabalho: 'bg-blue-100 text-blue-800',
    pessoal: 'bg-purple-100 text-purple-800',
    saude: 'bg-green-100 text-green-800',
    outros: 'bg-gray-100 text-gray-800'
  }
  return colors[category]
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [category, setCategory] = useState<Category>('outros')
  const [loading, setLoading] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const supabase = createClient()

  // Carregar tarefas
  const loadTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  // Adicionar tarefa
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ 
          title: newTask.trim(), 
          priority,
          category,
          completed: false
        }])
        .select()
        .single()

      if (error) throw error
      setTasks(prev => [data, ...prev])
      setNewTask('')
      
      // Feedback visual de sucesso
      const audio = new Audio('/sounds/success.mp3')
      audio.play()
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }

  // Alternar status da tarefa
  const toggleTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id)

      if (error) throw error
      
      setTasks(prev =>
        prev.map(t =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      )

      // Feedback sonoro e visual
      if (!task.completed) {
        const audio = new Audio('/sounds/complete.mp3')
        audio.play()
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  // Deletar tarefa
  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
  }

  // Filtrar tarefas visíveis
  const visibleTasks = tasks
    .filter(task => showCompleted ? true : !task.completed)
    .slice(0, MAX_VISIBLE_TASKS)

  return (
    <div className="space-y-4">
      <form onSubmit={addTask} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nova tarefa..."
            className="flex-1 rounded-md border p-2 focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Adicionar
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="rounded-md border p-2"
          >
            <option value="low">Baixa Prioridade</option>
            <option value="medium">Média Prioridade</option>
            <option value="high">Alta Prioridade</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-md border p-2"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Tarefas ({tasks.filter(t => !t.completed).length} pendentes)
        </h3>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {showCompleted ? 'Ocultar Concluídas' : 'Mostrar Concluídas'}
        </button>
      </div>

      <ul className="space-y-2">
        {visibleTasks.map(task => (
          <li
            key={task.id}
            className={`flex items-center gap-2 p-3 rounded-md transition-all duration-200 ${
              task.completed 
                ? 'bg-gray-50 opacity-75' 
                : task.priority === 'high'
                ? 'bg-red-50 border-l-4 border-red-500'
                : task.priority === 'medium'
                ? 'bg-yellow-50 border-l-4 border-yellow-500'
                : 'bg-green-50 border-l-4 border-green-500'
            }`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className={task.completed ? 'line-through text-gray-500' : ''}>
                {task.title}
              </span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getCategoryColor(task.category as Category)}`}>
                {task.category}
              </span>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {tasks.length > MAX_VISIBLE_TASKS && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {MAX_VISIBLE_TASKS} de {tasks.length} tarefas
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500">Carregando...</div>
      )}
    </div>
  )
} 