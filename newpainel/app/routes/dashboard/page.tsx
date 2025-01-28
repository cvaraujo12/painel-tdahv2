'use client'

import { useAuth } from '@/hooks/use-auth'
import TaskList from './components/task-list'
import NoteList from './components/note-list'
import GoalList from './components/goal-list'
import PomodoroTimer from './components/pomodoro-timer'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {user?.email}
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao seu painel de controle
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Tarefas */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tarefas</h2>
          <TaskList />
        </section>

        {/* Seção de Notas */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Notas Rápidas</h2>
          <NoteList />
        </section>

        {/* Seção de Metas */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Metas</h2>
          <GoalList />
        </section>

        {/* Seção do Pomodoro */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pomodoro</h2>
          <PomodoroTimer />
        </section>
      </div>
    </div>
  )
} 