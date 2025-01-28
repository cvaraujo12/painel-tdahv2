'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Goal = Database['public']['Tables']['goals']['Row']
type Period = 'daily' | 'weekly' | 'monthly'

export default function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [period, setPeriod] = useState<Period>('weekly')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Carregar metas
  const loadGoals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar meta
  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.trim()) return

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ title: newGoal.trim(), period }])
        .select()
        .single()

      if (error) throw error
      setGoals(prev => [data, ...prev])
      setNewGoal('')
    } catch (error) {
      console.error('Erro ao adicionar meta:', error)
    }
  }

  // Alternar status da meta
  const toggleGoal = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !goal.completed })
        .eq('id', goal.id)

      if (error) throw error
      setGoals(prev =>
        prev.map(g =>
          g.id === goal.id ? { ...g, completed: !g.completed } : g
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar meta:', error)
    }
  }

  // Deletar meta
  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setGoals(prev => prev.filter(g => g.id !== id))
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addGoal} className="flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Nova meta..."
          className="flex-1 rounded-md border p-2"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-md border p-2"
        >
          <option value="daily">Diária</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {goals.map(goal => (
          <div
            key={goal.id}
            className="flex items-center gap-2 p-3 bg-white rounded-lg shadow"
          >
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={() => toggleGoal(goal)}
              className="h-4 w-4"
            />
            <div className="flex-1">
              <p className={goal.completed ? 'line-through text-gray-500' : ''}>
                {goal.title}
              </p>
              <span className="text-xs text-gray-500">
                {goal.period === 'daily' ? 'Diária' :
                 goal.period === 'weekly' ? 'Semanal' : 'Mensal'}
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                goal.completed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {goal.completed ? 'Concluída' : 'Em progresso'}
            </span>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="text-red-500 hover:text-red-700"
            >
              Deletar
            </button>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center text-gray-500">Carregando...</div>
      )}
    </div>
  )
} 