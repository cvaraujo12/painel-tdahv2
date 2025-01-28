import { useState, useEffect } from 'react'

interface PomodoroStats {
	sessionsCompleted: number
	totalFocusTime: number
	averageFocusTime: number
	lastBreakTime: number
}

interface PomodoroTimerProps {
	initialTime?: number
	breakTime?: number
	onComplete?: () => void
}

export function PomodoroTimer({
	initialTime = 25,
	breakTime = 5,
	onComplete
}: PomodoroTimerProps) {
	const [minutes, setMinutes] = useState(initialTime)
	const [seconds, setSeconds] = useState(0)
	const [isActive, setIsActive] = useState(false)
	const [isBreak, setIsBreak] = useState(false)
	const [showStartGuide, setShowStartGuide] = useState(true)
	const [stats, setStats] = useState<PomodoroStats>({
		sessionsCompleted: 0,
		totalFocusTime: 0,
		averageFocusTime: 0,
		lastBreakTime: breakTime
	})

	// Calcula tempo de intervalo adaptativo baseado no desempenho
	const calculateAdaptiveBreak = (focusTime: number): number => {
		// Baseado em evidências de Sonuga-Barke (2014)
		const baseBreak = breakTime
		const performanceFactor = focusTime / (initialTime * 60)
		return Math.max(Math.round(baseBreak * performanceFactor), 3)
	}

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null

		if (isActive) {
			interval = setInterval(() => {
				if (seconds === 0) {
					if (minutes === 0) {
						setIsActive(false)
						if (!isBreak) {
							// Atualiza estatísticas ao completar sessão de foco
							const newStats = {
								sessionsCompleted: stats.sessionsCompleted + 1,
								totalFocusTime: stats.totalFocusTime + initialTime,
								averageFocusTime:
									(stats.totalFocusTime + initialTime) / (stats.sessionsCompleted + 1),
								lastBreakTime: calculateAdaptiveBreak(initialTime)
							}
							setStats(newStats)
							
							if (onComplete) onComplete()
							setIsBreak(true)
							setMinutes(newStats.lastBreakTime)
						} else {
							setIsBreak(false)
							setMinutes(initialTime)
						}
						setSeconds(0)
					} else {
						setMinutes(minutes - 1)
						setSeconds(59)
					}
				} else {
					setSeconds(seconds - 1)
				}
			}, 1000)
		}

		return () => {
			if (interval) clearInterval(interval)
		}
	}, [isActive, minutes, seconds, isBreak, initialTime, onComplete])

	const toggleTimer = () => {
		setIsActive(!isActive)
		setShowStartGuide(false)
	}

	const resetTimer = () => {
		setIsActive(false)
		setIsBreak(false)
		setMinutes(initialTime)
		setSeconds(0)
	}

	// Calcula progresso para feedback visual
	const progress = isBreak
		? ((stats.lastBreakTime * 60 - (minutes * 60 + seconds)) /
				(stats.lastBreakTime * 60)) *
		  100
		: ((initialTime * 60 - (minutes * 60 + seconds)) / (initialTime * 60)) * 100

	return (
		<div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 border-2 border-transparent hover:border-primary-300 transition-all duration-300">
			<div className="text-center">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
					{isBreak ? 'Intervalo' : 'Tempo de Foco'}
				</h2>
				
				{/* Guia de Início */}
				{showStartGuide && !isActive && (
					<div className="mb-6 p-4 bg-primary-50 dark:bg-gray-700 rounded-lg">
						<p className="text-sm text-gray-600 dark:text-gray-300">
							Clique em Iniciar para começar sua sessão de foco.
							{!isBreak && ' Mantenha o foco por 25 minutos!'}
						</p>
					</div>
				)}

				{/* Barra de Progresso */}
				<div className="mt-4 h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700 p-1">
					<div
						className={`h-2 rounded-full transition-all duration-300 ${
							isBreak ? 'bg-green-500' : 'bg-primary-600'
						}`}
						style={{ width: `${progress}%` }}
					/>
				</div>

				<div className="mt-6 text-5xl font-bold text-gray-900 dark:text-white">
					{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
				</div>

				<div className="mt-8 flex justify-center space-x-4">
					<button
						onClick={toggleTimer}
						className={`rounded-lg px-8 py-3 text-lg font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-4 ${
							isActive
								? 'bg-red-500 hover:bg-red-600 focus:ring-red-200'
								: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-200'
						}`}
						aria-label={isActive ? 'Pausar timer' : 'Iniciar timer'}
					>
						{isActive ? 'Pausar' : 'Iniciar'}
					</button>
					<button
						onClick={resetTimer}
						className="rounded-lg border-2 border-gray-300 px-8 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
						aria-label="Reiniciar timer"
					>
						Reiniciar
					</button>
				</div>

				{/* Estatísticas */}
				<div className="mt-8 grid grid-cols-2 gap-6 text-center">
					<div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
						<p className="text-sm text-gray-600 dark:text-gray-400">Sessões Completadas</p>
						<p className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
							{stats.sessionsCompleted}
						</p>
					</div>
					<div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
						<p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio de Foco</p>
						<p className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
							{Math.round(stats.averageFocusTime)} min
						</p>
					</div>
				</div>
			</div>
		</div>
	)
} 