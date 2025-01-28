import { useState, useEffect } from 'react'
import { FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi'

export default function Pomodoro() {
  const [time, setTime] = useState(25 * 60) // 25 minutos em segundos
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1)
      }, 1000)
    } else if (time === 0) {
      // Quando o timer chega a zero
      if (!isBreak) {
        // Se estava em foco, inicia pausa
        setTime(5 * 60) // 5 minutos de pausa
        setIsBreak(true)
        // Notificação visual e sonora
        new Audio('/notification.mp3').play().catch(() => {})
        if (Notification.permission === 'granted') {
          new Notification('Tempo de foco concluído!', {
            body: 'Hora de fazer uma pausa.',
            icon: '/icon.png'
          })
        }
      } else {
        // Se estava em pausa, reinicia ciclo
        setTime(25 * 60)
        setIsBreak(false)
        setCycles(c => c + 1)
        setIsActive(false)
        // Notificação visual e sonora
        new Audio('/notification.mp3').play().catch(() => {})
        if (Notification.permission === 'granted') {
          new Notification('Pausa concluída!', {
            body: 'Vamos voltar ao foco?',
            icon: '/icon.png'
          })
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time, isBreak])

  const toggleTimer = () => {
    if (!isActive && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setTime(25 * 60)
    setIsActive(false)
    setIsBreak(false)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = (): number => {
    const total = isBreak ? 5 * 60 : 25 * 60
    return ((total - time) / total) * 100
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isBreak ? 'Tempo de Pausa' : 'Tempo de Foco'}
      </h2>

      {/* Barra de progresso */}
      <div className="w-full h-4 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 rounded-full ${
            isBreak ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Timer */}
      <div className="text-6xl font-bold text-center mb-8">
        {formatTime(time)}
      </div>

      {/* Controles */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleTimer}
          className={`p-4 rounded-full ${
            isActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors`}
          aria-label={isActive ? 'Pausar' : 'Iniciar'}
        >
          {isActive ? <FiPause size={24} /> : <FiPlay size={24} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          aria-label="Reiniciar"
        >
          <FiRefreshCw size={24} />
        </button>
      </div>

      {/* Ciclos completados */}
      <div className="text-center text-gray-600">
        <p>Ciclos completados: {cycles}</p>
      </div>

      {/* Dicas */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Dicas para manter o foco:</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Mantenha seu espaço de trabalho organizado</li>
          <li>• Use fones de ouvido para reduzir distrações</li>
          <li>• Faça pequenas pausas para se movimentar</li>
          <li>• Beba água regularmente</li>
        </ul>
      </div>
    </div>
  )
} 