import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import { supabase } from '~/utils/supabase.client'
import { useEffect, useState } from 'react'
import TaskList from './dashboard/components/task-list'
import NoteList from './dashboard/components/note-list'
import GoalList from './dashboard/components/goal-list'
import PomodoroTimer from './dashboard/components/pomodoro-timer'
import { FiCheckSquare, FiFileText, FiTarget, FiClock } from 'react-icons/fi'

interface DashboardData {
  tasks: number
  notes: number
  goals: number
  pomodoros: number
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function DashboardIndex() {
  const { user } = useLoaderData<typeof loader>()
  const [data, setData] = useState<DashboardData>({
    tasks: 0,
    notes: 0,
    goals: 0,
    pomodoros: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [tasks, notes, goals, pomodoros] = await Promise.all([
          supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('notes').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('goals').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('pomodoro_sessions').select('id', { count: 'exact' }).eq('user_id', user.id)
        ])

        setData({
          tasks: tasks.count || 0,
          notes: notes.count || 0,
          goals: goals.count || 0,
          pomodoros: pomodoros.count || 0
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p><strong>Erro:</strong> {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Bem-vindo, {user.email}!
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Tarefas</h2>
          <p className="text-3xl font-bold text-blue-600">{data.tasks}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Notas</h2>
          <p className="text-3xl font-bold text-green-600">{data.notes}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Metas</h2>
          <p className="text-3xl font-bold text-purple-600">{data.goals}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Sessões Pomodoro</h2>
          <p className="text-3xl font-bold text-red-600">{data.pomodoros}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Dicas Rápidas</h2>
        <ul className="space-y-2 text-gray-600">
          <li>• Use o Pomodoro para manter o foco: 25 minutos de trabalho, 5 de pausa</li>
          <li>• Divida tarefas grandes em subtarefas menores e mais gerenciáveis</li>
          <li>• Mantenha notas curtas e objetivas para facilitar a revisão</li>
          <li>• Estabeleça metas realistas e celebre cada conquista</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FiCheckSquare size={20} />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">Tarefas</h2>
          </div>
          <TaskList />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-green-100 text-green-600 rounded-lg">
              <FiFileText size={20} />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">Notas</h2>
          </div>
          <NoteList />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <FiTarget size={20} />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">Metas</h2>
          </div>
          <GoalList />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-red-100 text-red-600 rounded-lg">
              <FiClock size={20} />
            </span>
            <h2 className="text-xl font-semibold text-gray-800">Pomodoro</h2>
          </div>
          <PomodoroTimer />
        </div>
      </div>
    </div>
  )
} 