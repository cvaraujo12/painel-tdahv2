import { useState } from 'react'

interface Task {
	id: string
	title: string
	completed: boolean
	priority: number
}

interface TaskListProps {
	initialTasks?: Task[]
	onTaskComplete?: (taskId: string) => void
	onTaskAdd?: (task: Omit<Task, 'id'>) => void
	onTaskDelete?: (taskId: string) => void
	onTaskEdit?: (task: Task) => void
}

export function TaskList({
	initialTasks = [],
	onTaskComplete,
	onTaskAdd,
	onTaskDelete,
	onTaskEdit
}: TaskListProps) {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [newTaskTitle, setNewTaskTitle] = useState('')
	const [editingTask, setEditingTask] = useState<Task | null>(null)
	const [taskPriority, setTaskPriority] = useState(1)

	const handleAddTask = () => {
		if (!newTaskTitle.trim()) return

		const newTask = {
			id: crypto.randomUUID(),
			title: newTaskTitle,
			completed: false,
			priority: taskPriority
		}

		setTasks([...tasks, newTask])
		setNewTaskTitle('')
		setTaskPriority(1)
		if (onTaskAdd) {
			onTaskAdd({
				title: newTask.title,
				completed: newTask.completed,
				priority: newTask.priority
			})
		}
	}

	const toggleTask = (taskId: string) => {
		setTasks(
			tasks.map((task) =>
				task.id === taskId
					? { ...task, completed: !task.completed }
					: task
			)
		)
		if (onTaskComplete) onTaskComplete(taskId)
	}

	const handleDeleteTask = (taskId: string) => {
		setTasks(tasks.filter((task) => task.id !== taskId))
		if (onTaskDelete) onTaskDelete(taskId)
	}

	const handleEditTask = (task: Task) => {
		setEditingTask(task)
		setNewTaskTitle(task.title)
		setTaskPriority(task.priority)
	}

	const handleUpdateTask = () => {
		if (!editingTask || !newTaskTitle.trim()) return

		const updatedTasks = tasks.map((task) =>
			task.id === editingTask.id
				? { ...task, title: newTaskTitle, priority: taskPriority }
				: task
		)

		setTasks(updatedTasks)
		setEditingTask(null)
		setNewTaskTitle('')
		setTaskPriority(1)
		
		if (onTaskEdit) {
			onTaskEdit({ ...editingTask, title: newTaskTitle, priority: taskPriority })
		}
	}

	const handleCancelEdit = () => {
		setEditingTask(null)
		setNewTaskTitle('')
		setTaskPriority(1)
	}

	const getPriorityColor = (priority: number): string => {
		switch (priority) {
			case 3:
				return 'text-red-600 dark:text-red-400'
			case 2:
				return 'text-yellow-600 dark:text-yellow-400'
			default:
				return 'text-green-600 dark:text-green-400'
		}
	}

	return (
		<div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 border-2 border-transparent hover:border-primary-300 transition-all duration-300">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
				Tarefas
			</h2>
			
			<div className="mt-4">
				<div className="space-y-4">
					<div className="flex gap-2">
						<input
							type="text"
							value={newTaskTitle}
							onChange={(e) => setNewTaskTitle(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									editingTask ? handleUpdateTask() : handleAddTask()
								}
							}}
							placeholder={editingTask ? 'Edite a tarefa...' : 'Nova tarefa...'}
							className="flex-1 rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300"
							aria-label={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
						/>
						<select
							value={taskPriority}
							onChange={(e) => setTaskPriority(Number(e.target.value))}
							className="rounded-lg border-2 border-gray-300 bg-white shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
							aria-label="Prioridade da tarefa"
						>
							<option value={1}>Baixa</option>
							<option value={2}>Média</option>
							<option value={3}>Alta</option>
						</select>
					</div>
					<div className="flex gap-2">
						<button
							onClick={editingTask ? handleUpdateTask : handleAddTask}
							className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-300"
							aria-label={editingTask ? 'Salvar edição' : 'Adicionar tarefa'}
						>
							{editingTask ? 'Salvar Edição' : 'Adicionar'}
						</button>
						{editingTask && (
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

				<ul className="mt-6 space-y-2">
					{tasks.map((task) => (
						<li
							key={task.id}
							className="group relative flex items-center gap-2 rounded-lg border-2 border-gray-200 p-4 hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-500 transition-all duration-300"
						>
							<input
								type="checkbox"
								checked={task.completed}
								onChange={() => toggleTask(task.id)}
								className="h-5 w-5 rounded-md border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
								aria-label={`Marcar tarefa "${task.title}" como ${
									task.completed ? 'não concluída' : 'concluída'
								}`}
							/>
							<div className="flex-1">
								<span
									className={`${
										task.completed
											? 'text-gray-500 line-through'
											: 'text-gray-900 dark:text-white'
									}`}
								>
									{task.title}
								</span>
								<span className={`ml-2 text-sm ${getPriorityColor(task.priority)}`}>
									{task.priority === 3
										? '(Alta)'
										: task.priority === 2
										? '(Média)'
										: '(Baixa)'}
								</span>
							</div>
							
							{/* Botões de ação */}
							<div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<button
									onClick={() => handleEditTask(task)}
									className="rounded-md bg-primary-100 p-2 text-primary-600 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-gray-600"
									aria-label="Editar tarefa"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</button>
								<button
									onClick={() => handleDeleteTask(task.id)}
									className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
									aria-label="Excluir tarefa"
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
		</div>
	)
} 