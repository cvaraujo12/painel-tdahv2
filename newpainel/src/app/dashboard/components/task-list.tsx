'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Carregar tarefas
  const loadTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar tarefa
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: newTask.trim(), priority }])
        .select()
        .single()

      if (error) throw error
      setTasks(prev => [data, ...prev])
      setNewTask('')
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

  return (
    <div className="space-y-4">
      <form onSubmit={addTask} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nova tarefa..."
          className="flex-1 rounded-md border p-2"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="rounded-md border p-2"
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Adicionar
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map(task => (
          <li
            key={task.id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
              className="h-4 w-4"
            />
            <span
              className={`flex-1 ${
                task.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {task.priority}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              Deletar
            </button>
          </li>
        ))}
      </ul>

      {loading && (
        <div className="text-center text-gray-500">Carregando...</div>
      )}
    </div>
  )
} 