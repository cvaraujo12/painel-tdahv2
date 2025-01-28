'use client'

import { useState, useEffect } from 'react'
import { useStore } from '~/store'
import { Task } from '~/types'

export default function TaskList() {
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'média' as const
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { 
    tasks, 
    addTask, 
    deleteTask, 
    toggleTask, 
    editTask,
    isLoading,
    error,
    syncWithSupabase 
  } = useStore()

  useEffect(() => {
    syncWithSupabase()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      if (editingTask) {
        await editTask(editingTask.id, {
          title: newTask.title,
          priority: newTask.priority
        })
        setEditingTask(null)
      } else {
        const task: Task = {
          id: Date.now().toString(),
          title: newTask.title,
          priority: newTask.priority,
          completed: false,
          createdAt: new Date().toISOString()
        }
        await addTask(task)
      }

      setNewTask({
        title: '',
        priority: 'média'
      })
    } catch (err) {
      console.error('Erro ao salvar tarefa:', err)
    }
  }

  const startEditing = (task: Task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      priority: task.priority
    })
  }

  const cancelEditing = () => {
    setEditingTask(null)
    setNewTask({
      title: '',
      priority: 'média'
    })
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleTask(id)
    } catch (err) {
      console.error('Erro ao alternar tarefa:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
    } catch (err) {
      console.error('Erro ao deletar tarefa:', err)
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800'
      case 'média':
        return 'bg-yellow-100 text-yellow-800'
      case 'baixa':
        return 'bg-green-100 text-green-800'
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Erro ao carregar tarefas: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Digite sua tarefa..."
            className="w-full sm:w-auto flex-1 p-2 border rounded"
            disabled={isLoading}
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
            className="w-full sm:w-32 p-2 border rounded"
            disabled={isLoading}
          >
            <option value="baixa">Baixa</option>
            <option value="média">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            type="submit"
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : editingTask ? 'Atualizar' : 'Adicionar'}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={cancelEditing}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {isLoading && !tasks.length ? (
        <div className="p-4 text-center text-gray-500">
          Carregando tarefas...
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className="p-4 bg-white rounded shadow flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex items-start sm:items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  className="mt-1 sm:mt-0 w-5 h-5"
                  disabled={isLoading}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className={`text-gray-800 break-words ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)} w-fit`}>
                      {task.priority}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => startEditing(task)}
                  className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 