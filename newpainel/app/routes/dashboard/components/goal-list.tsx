'use client'

import { useState, useEffect } from 'react'
import { useStore } from '~/store'
import { Goal } from '~/types'

export default function GoalList() {
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: ''
  })
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const { 
    goals, 
    addGoal, 
    deleteGoal, 
    toggleGoal, 
    editGoal,
    isLoading,
    error,
    syncWithSupabase 
  } = useStore()

  useEffect(() => {
    syncWithSupabase()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.title.trim() || !newGoal.description.trim() || !newGoal.deadline) return

    try {
      if (editingGoal) {
        await editGoal(editingGoal.id, {
          title: newGoal.title,
          description: newGoal.description,
          deadline: newGoal.deadline
        })
        setEditingGoal(null)
      } else {
        const goal: Goal = {
          id: Date.now().toString(),
          title: newGoal.title,
          description: newGoal.description,
          deadline: newGoal.deadline,
          completed: false,
          createdAt: new Date().toISOString()
        }
        await addGoal(goal)
      }

      setNewGoal({
        title: '',
        description: '',
        deadline: ''
      })
    } catch (err) {
      console.error('Erro ao salvar meta:', err)
    }
  }

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal)
    setNewGoal({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline
    })
  }

  const cancelEditing = () => {
    setEditingGoal(null)
    setNewGoal({
      title: '',
      description: '',
      deadline: ''
    })
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleGoal(id)
    } catch (err) {
      console.error('Erro ao alternar meta:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id)
    } catch (err) {
      console.error('Erro ao deletar meta:', err)
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Erro ao carregar metas: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título da meta..."
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>
          <div className="sm:col-span-2">
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da meta..."
              className="w-full p-2 border rounded h-24 resize-y"
              disabled={isLoading}
            />
          </div>
          <div className="sm:col-span-1">
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>
          <div className="sm:col-span-1 flex gap-2">
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : editingGoal ? 'Atualizar Meta' : 'Adicionar Meta'}
            </button>
            {editingGoal && (
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 whitespace-nowrap"
                disabled={isLoading}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {isLoading && !goals.length ? (
        <div className="p-4 text-center text-gray-500">
          Carregando metas...
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div 
              key={goal.id}
              className="p-4 bg-white rounded shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => handleToggle(goal.id)}
                    className="mt-1 w-5 h-5"
                    disabled={isLoading}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold break-words ${goal.completed ? 'line-through' : ''}`}>
                      {goal.title}
                    </h3>
                    <p className="text-gray-600 mt-1 break-words">{goal.description}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Prazo: {new Date(goal.deadline).toLocaleDateString()}</p>
                      <p>Criado em: {new Date(goal.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => startEditing(goal)}
                    className="text-blue-500 hover:text-blue-600 disabled:opacity-50 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 