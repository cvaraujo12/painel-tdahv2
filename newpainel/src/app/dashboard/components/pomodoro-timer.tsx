'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row']

const WORK_TIME = 25 * 60 // 25 minutos em segundos
const BREAK_TIME = 5 * 60 // 5 minutos em segundos

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const supabase = createClient()

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Carregar sessões
  const loadSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    }
  }, [supabase])

  // Salvar sessão
  const saveSession = async (duration: number, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .insert([{ duration, completed }])

      if (error) throw error
      loadSessions()
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
    }
  }

  // Alternar timer
  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  // Resetar timer
  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(WORK_TIME)
  }

  // Efeito do timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Quando o timer chega a zero
      if (!isBreak) {
        // Fim do período de trabalho
        saveSession(WORK_TIME, true)
        setTimeLeft(BREAK_TIME)
        setIsBreak(true)
      } else {
        // Fim do intervalo
        setTimeLeft(WORK_TIME)
        setIsBreak(false)
      }
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isBreak])

  // Carregar sessões iniciais
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          {isBreak ? 'Intervalo' : 'Foco'}
        </h3>
        <div className="text-4xl font-mono mb-4">
          {formatTime(timeLeft)}
        </div>
        <div className="space-x-2">
          <button
            onClick={toggleTimer}
            className={`px-4 py-2 rounded-md ${
              isActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isActive ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
          >
            Resetar
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Últimas sessões</h4>
        <div className="space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
            >
              <span>
                {Math.floor(session.duration / 60)} minutos
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  session.completed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {session.completed ? 'Completo' : 'Interrompido'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(session.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 