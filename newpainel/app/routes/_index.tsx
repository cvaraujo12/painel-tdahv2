import type { MetaFunction } from '@remix-run/node'
import { PomodoroTimer } from '~/components/pomodoro-timer'
import { TaskList } from '~/components/task-list'
import { QuickNotes } from '~/components/quick-notes'
import { DailyGoals } from '~/components/daily-goals'
import { SimpleCalendar } from '~/components/simple-calendar'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Painel TDAH' },
		{ name: 'description', content: 'Seu painel pessoal de gerenciamento TDAH' },
	]
}

export default function Index() {
	return (
		<main className="min-h-screen bg-background p-8 dark:bg-background-dark">
			<h1 className="mb-8 text-4xl font-bold text-foreground dark:text-foreground-dark">
				Painel TDAH
			</h1>
			
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Coluna 1 - Foco e Tarefas */}
				<div className="flex flex-col gap-6">
					<PomodoroTimer />
					<TaskList />
				</div>

				{/* Coluna 2 - Notas e Metas */}
				<div className="flex flex-col gap-6">
					<QuickNotes />
					<DailyGoals />
				</div>

				{/* Coluna 3 - Calendário */}
				<div className="lg:col-span-1">
					<SimpleCalendar />
				</div>
			</div>
		</main>
	)
} 
