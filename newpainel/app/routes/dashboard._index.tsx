import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import TaskList from './dashboard/components/task-list'
import NoteList from './dashboard/components/note-list'
import GoalList from './dashboard/components/goal-list'
import PomodoroTimer from './dashboard/components/pomodoro-timer'
import { FiCheckSquare, FiFileText, FiTarget, FiClock } from 'react-icons/fi'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function DashboardIndex() {
  const { user } = useLoaderData<{ user: { email: string } }>()

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Bem-vindo, {user.email}!
        </h1>
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