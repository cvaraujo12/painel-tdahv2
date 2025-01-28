import { useState } from 'react'

type GoalPeriod = 'daily' | 'weekly' | 'monthly'

interface Goal {
	id: string
	title: string
	completed: boolean
	period: GoalPeriod
	createdAt: Date
}

interface DailyGoalsProps {
	initialGoals?: Goal[]
	onGoalAdd?: (goal: Omit<Goal, 'id'>) => void
	onGoalToggle?: (goalId: string) => void
	onGoalDelete?: (goalId: string) => void
	onGoalEdit?: (goal: Goal) => void
}

export function DailyGoals({
	initialGoals = [],
	onGoalAdd,
	onGoalToggle,
	onGoalDelete,
	onGoalEdit
}: DailyGoalsProps) {
	const [goals, setGoals] = useState<Goal[]>(initialGoals)
	const [newGoal, setNewGoal] = useState('')
	const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('daily')
	const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

	const handleAddGoal = () => {
		if (!newGoal.trim()) return

		const goal = {
			id: crypto.randomUUID(),
			title: newGoal,
			completed: false,
			period: selectedPeriod,
			createdAt: new Date()
		}

		setGoals([...goals, goal])
		setNewGoal('')
		if (onGoalAdd) {
			onGoalAdd({
				title: goal.title,
				completed: goal.completed,
				period: goal.period,
				createdAt: goal.createdAt
			})
		}
	}

	const toggleGoal = (goalId: string) => {
		setGoals(
			goals.map((goal) =>
				goal.id === goalId
					? { ...goal, completed: !goal.completed }
					: goal
			)
		)
		if (onGoalToggle) onGoalToggle(goalId)
	}

	const handleDeleteGoal = (goalId: string) => {
		setGoals(goals.filter((goal) => goal.id !== goalId))
		if (onGoalDelete) onGoalDelete(goalId)
	}

	const handleEditGoal = (goal: Goal) => {
		setEditingGoal(goal)
		setNewGoal(goal.title)
		setSelectedPeriod(goal.period)
	}

	const handleUpdateGoal = () => {
		if (!editingGoal || !newGoal.trim()) return

		const updatedGoals = goals.map((goal) =>
			goal.id === editingGoal.id
				? { ...goal, title: newGoal, period: selectedPeriod }
				: goal
		)

		setGoals(updatedGoals)
		setEditingGoal(null)
		setNewGoal('')
		
		if (onGoalEdit) {
			onGoalEdit({ ...editingGoal, title: newGoal, period: selectedPeriod })
		}
	}

	const handleCancelEdit = () => {
		setEditingGoal(null)
		setNewGoal('')
	}

	const filterGoals = (period: GoalPeriod) => {
		return goals.filter((goal) => goal.period === period)
	}

	const getProgressPercentage = (period: GoalPeriod) => {
		const filteredGoals = filterGoals(period)
		if (filteredGoals.length === 0) return 0
		const completed = filteredGoals.filter((goal) => goal.completed).length
		return Math.round((completed / filteredGoals.length) * 100)
	}

	return (
		<div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 border-2 border-transparent hover:border-primary-300 transition-all duration-300">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
				Metas
			</h2>

			<div className="mt-4">
				<div className="space-y-4">
					<div className="flex gap-2">
						<input
							type="text"
							value={newGoal}
							onChange={(e) => setNewGoal(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									editingGoal ? handleUpdateGoal() : handleAddGoal()
								}
							}}
							placeholder={editingGoal ? 'Edite a meta...' : 'Nova meta...'}
							className="flex-1 rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300"
							aria-label={editingGoal ? 'Editar meta' : 'Nova meta'}
						/>
						<select
							value={selectedPeriod}
							onChange={(e) => setSelectedPeriod(e.target.value as GoalPeriod)}
							className="rounded-lg border-2 border-gray-300 bg-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							aria-label="Período da meta"
						>
							<option value="daily">Diária</option>
							<option value="weekly">Semanal</option>
							<option value="monthly">Mensal</option>
						</select>
					</div>
					<div className="flex gap-2">
						<button
							onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
							className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-300"
							aria-label={editingGoal ? 'Salvar edição' : 'Adicionar meta'}
						>
							{editingGoal ? 'Salvar Edição' : 'Adicionar'}
						</button>
						{editingGoal && (
							<button
								onClick={handleCancelEdit}
								className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
								aria-label="Cancelar edição"
							>
								Cancelar
							</button>
						)}
					</div>
				</div>

				{/* Progresso */}
				<div className="mt-6 space-y-4">
					{(['daily', 'weekly', 'monthly'] as GoalPeriod[]).map((period) => (
						<div key={period} className="space-y-2">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{period === 'daily'
										? 'Metas Diárias'
										: period === 'weekly'
										? 'Metas Semanais'
										: 'Metas Mensais'}
								</h3>
								<span className="text-sm text-gray-500">
									{getProgressPercentage(period)}%
								</span>
							</div>
							<div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									className="h-2 rounded-full bg-primary-600 transition-all dark:bg-primary-500"
									style={{ width: `${getProgressPercentage(period)}%` }}
								/>
							</div>
						</div>
					))}
				</div>

				{/* Lista de Metas */}
				<div className="mt-6">
					{(['daily', 'weekly', 'monthly'] as GoalPeriod[]).map((period) => (
						<div key={period} className="mb-4">
							<h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								{period === 'daily'
									? 'Hoje'
									: period === 'weekly'
									? 'Esta Semana'
									: 'Este Mês'}
							</h3>
							<ul className="space-y-2">
								{filterGoals(period).map((goal) => (
									<li
										key={goal.id}
										className="group relative flex items-center gap-2 rounded-lg border-2 border-gray-200 p-4 hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-500 transition-all duration-300"
									>
										<input
											type="checkbox"
											checked={goal.completed}
											onChange={() => toggleGoal(goal.id)}
											className="h-5 w-5 rounded-md border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
											aria-label={`Marcar meta "${goal.title}" como ${
												goal.completed ? 'não concluída' : 'concluída'
											}`}
										/>
										<span
											className={`flex-1 ${
												goal.completed
													? 'text-gray-500 line-through'
													: 'text-gray-900 dark:text-white'
											}`}
										>
											{goal.title}
										</span>
										
										{/* Botões de ação */}
										<div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
											<button
												onClick={() => handleEditGoal(goal)}
												className="rounded-md bg-primary-100 p-2 text-primary-600 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-gray-600"
												aria-label="Editar meta"
											>
												<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
												</svg>
											</button>
											<button
												onClick={() => handleDeleteGoal(goal.id)}
												className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
												aria-label="Excluir meta"
											>
												<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</div>
	)
} 