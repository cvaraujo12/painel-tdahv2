'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Goal = Database['public']['Tables']['goals']['Row']
type Period = 'daily' | 'weekly' | 'monthly'
type Category = 'saude' | 'trabalho' | 'pessoal' | 'aprendizado'

const PERIODS: Record<Period, { label: string, emoji: string }> = {
  daily: { label: 'Diária', emoji: '📅' },
  weekly: { label: 'Semanal', emoji: '📆' },
  monthly: { label: 'Mensal', emoji: '📊' }
}

const CATEGORIES: Record<Category, { label: string, emoji: string, color: string }> = {
  saude: { label: 'Saúde', emoji: '💪', color: 'green' },
  trabalho: { label: 'Trabalho', emoji: '💼', color: 'blue' },
  pessoal: { label: 'Pessoal', emoji: '🎯', color: 'purple' },
  aprendizado: { label: 'Aprendizado', emoji: '📚', color: 'yellow' }
}

const MAX_VISIBLE_GOALS = 5 // Limite de metas visíveis por vez

export default function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [period, setPeriod] = useState<Period>('weekly')
  const [category, setCategory] = useState<Category>('pessoal')
  const [loading, setLoading] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const supabase = createClient()

  // Carregar metas
  const loadGoals = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('period', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [])

  // Adicionar meta
  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.trim()) return

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ 
          title: newGoal.trim(), 
          period,
          category,
          completed: false,
          progress: 0
        }])
        .select()
        .single()

      if (error) throw error
      setGoals(prev => [data, ...prev])
      setNewGoal('')
      
      // Feedback sonoro
      const audio = new Audio('/sounds/success.mp3')
      audio.play()
    } catch (error) {
      console.error('Erro ao adicionar meta:', error)
    }
  }

  // Atualizar progresso
  const updateProgress = async (goal: Goal, newProgress: number) => {
    try {
      const wasCompleted = goal.completed
      const isNowCompleted = newProgress === 100
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          progress: newProgress,
          completed: isNowCompleted
        })
        .eq('id', goal.id)

      if (error) throw error
      
      setGoals(prev =>
        prev.map(g =>
          g.id === goal.id 
            ? { ...g, progress: newProgress, completed: isNowCompleted }
            : g
        )
      )

      // Celebração ao completar
      if (!wasCompleted && isNowCompleted) {
        setShowCelebration(true)
        const audio = new Audio('/sounds/complete.mp3')
        audio.play()
        setTimeout(() => setShowCelebration(false), 3000)
      }
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

  // Filtrar metas visíveis
  const visibleGoals = goals
    .filter(goal => showCompleted ? true : !goal.completed)
    .slice(0, MAX_VISIBLE_GOALS)

  return (
    <div className="space-y-4">
      {showCelebration && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
          🎉 Parabéns! Você completou uma meta!
        </div>
      )}

      <form onSubmit={addGoal} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Nova meta..."
            className="flex-1 rounded-lg border p-2 focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Adicionar
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded-lg border p-2"
          >
            {Object.entries(PERIODS).map(([key, { label, emoji }]) => (
              <option key={key} value={key}>
                {emoji} {label}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-lg border p-2"
          >
            {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
              <option key={key} value={key}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Metas ({goals.filter(g => !g.completed).length} em andamento)
        </h3>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {showCompleted ? 'Ocultar Concluídas' : 'Mostrar Concluídas'}
        </button>
      </div>

      <div className="space-y-3">
        {visibleGoals.map(goal => (
          <div
            key={goal.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              goal.completed
                ? 'bg-gray-50 border-gray-200'
                : `bg-${CATEGORIES[goal.category as Category].color}-50 border-${CATEGORIES[goal.category as Category].color}-200`
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span>{CATEGORIES[goal.category as Category].emoji}</span>
                <span>{PERIODS[goal.period].emoji}</span>
                <span className={goal.completed ? 'line-through text-gray-500' : ''}>
                  {goal.title}
                </span>
              </div>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso: {goal.progress}%</span>
                <div className="space-x-1">
                  {[0, 25, 50, 75, 100].map(value => (
                    <button
                      key={value}
                      onClick={() => updateProgress(goal, value)}
                      className={`px-2 py-1 rounded ${
                        goal.progress >= value
                          ? `bg-${CATEGORIES[goal.category as Category].color}-500 text-white`
                          : 'bg-gray-100'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${CATEGORIES[goal.category as Category].color}-500 transition-all duration-500`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {goals.length > MAX_VISIBLE_GOALS && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {MAX_VISIBLE_GOALS} de {goals.length} metas
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500">Carregando...</div>
      )}
    </div>
  )
} 