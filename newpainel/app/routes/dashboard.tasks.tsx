import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import { useAppStore } from '~/store'
import { useState } from 'react'
import { FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function Tasks() {
  const { user } = useLoaderData<typeof loader>()
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  
  const tasks = useAppStore((state) => state.tasks)
  const addTask = useAppStore((state) => state.addTask)
  const updateTask = useAppStore((state) => state.updateTask)
  const deleteTask = useAppStore((state) => state.deleteTask)
  const isLoading = useAppStore((state) => state.isLoading)

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    await addTask(user.id, {
      title: newTask,
      status: 'pending',
      priority
    })

    setNewTask('')
    setPriority('medium')
  }

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    await updateTask(user.id, taskId, {
      status: currentStatus === 'pending' ? 'completed' : 'pending'
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(user.id, taskId)
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tarefas</h1>

      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nova tarefa..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleToggleTask(task.id, task.status)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${task.status === 'completed' 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : 'border-gray-300'
                  }`}
              >
                {task.status === 'completed' && <FiCheck className="w-4 h-4" />}
              </button>

              <div>
                <p className={`${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa encontrada
          </div>
        )}
      </div>
    </div>
  )
} 