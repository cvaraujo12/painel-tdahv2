'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row']

// Tempos configuráveis (em segundos)
const POMODORO_PRESETS = {
  short: {
    work: 15 * 60, // 15 minutos
    break: 3 * 60  // 3 minutos
  },
  default: {
    work: 25 * 60, // 25 minutos
    break: 5 * 60  // 5 minutos
  },
  long: {
    work: 45 * 60, // 45 minutos
    break: 10 * 60 // 10 minutos
  }
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_PRESETS.default.work)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [selectedPreset, setSelectedPreset] = useState<'short' | 'default' | 'long'>('default')
  const [showMotivation, setShowMotivation] = useState(false)
  const supabase = createClient()

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Calcular progresso
  const calculateProgress = () => {
    const total = isBreak ? POMODORO_PRESETS[selectedPreset].break : POMODORO_PRESETS[selectedPreset].work
    return ((total - timeLeft) / total) * 100
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
      
      if (completed) {
        setShowMotivation(true)
        const audio = new Audio('/sounds/complete.mp3')
        audio.play()
        setTimeout(() => setShowMotivation(false), 3000)
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error)
    }
  }

  // Alternar timer
  const toggleTimer = () => {
    if (!isActive) {
      const audio = new Audio('/sounds/start.mp3')
      audio.play()
    }
    setIsActive(!isActive)
  }

  // Resetar timer
  const resetTimer = () => {
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(POMODORO_PRESETS[selectedPreset].work)
  }

  // Mudar preset
  const changePreset = (preset: 'short' | 'default' | 'long') => {
    setSelectedPreset(preset)
    setTimeLeft(POMODORO_PRESETS[preset].work)
    setIsActive(false)
    setIsBreak(false)
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
        saveSession(POMODORO_PRESETS[selectedPreset].work, true)
        setTimeLeft(POMODORO_PRESETS[selectedPreset].break)
        setIsBreak(true)
      } else {
        // Fim do intervalo
        setTimeLeft(POMODORO_PRESETS[selectedPreset].work)
        setIsBreak(false)
      }
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isBreak, selectedPreset])

  // Carregar sessões iniciais
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return (
    <div className="space-y-6">
      {showMotivation && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
          🎉 Parabéns! Você completou uma sessão!
        </div>
      )}

      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold mb-2">
          {isBreak ? '😌 Intervalo' : '🎯 Foco'}
        </h3>

        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => changePreset('short')}
            className={`px-3 py-1 rounded ${
              selectedPreset === 'short'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Curto (15min)
          </button>
          <button
            onClick={() => changePreset('default')}
            className={`px-3 py-1 rounded ${
              selectedPreset === 'default'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Normal (25min)
          </button>
          <button
            onClick={() => changePreset('long')}
            className={`px-3 py-1 rounded ${
              selectedPreset === 'long'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Longo (45min)
          </button>
        </div>

        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="88"
              className="stroke-current text-gray-200"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              className={`stroke-current ${
                isBreak ? 'text-green-500' : 'text-blue-500'
              }`}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - calculateProgress() / 100)}
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="space-x-2">
          <button
            onClick={toggleTimer}
            className={`px-6 py-3 rounded-lg font-medium ${
              isActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white transition-colors`}
          >
            {isActive ? '⏸️ Pausar' : '▶️ Iniciar'}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            🔄 Resetar
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">📊 Últimas sessões</h4>
        <div className="space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`flex justify-between items-center p-3 rounded-lg ${
                session.completed
                  ? 'bg-green-50 border-l-4 border-green-500'
                  : 'bg-yellow-50 border-l-4 border-yellow-500'
              }`}
            >
              <span className="font-medium">
                {Math.floor(session.duration / 60)} minutos
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  session.completed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {session.completed ? '✅ Completo' : '⏹️ Interrompido'}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(session.created_at).toLocaleDateString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 