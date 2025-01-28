import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSubmit } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import { supabase } from '~/utils/supabase.server'
import { useState } from 'react'
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi'

interface Task {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  user_id: string
  created_at: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Erro ao carregar tarefas')
  }

  return json({ user, tasks })
}

export async function action({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const action = formData.get('_action')

  if (action === 'create') {
    const title = formData.get('title')
    const priority = formData.get('priority')

    const { error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        title,
        priority,
        status: 'pending'
      }])

    if (error) throw error
  }

  if (action === 'toggle') {
    const id = formData.get('id')
    const status = formData.get('status') === 'pending' ? 'completed' : 'pending'

    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  if (action === 'delete') {
    const id = formData.get('id')

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  return json({ success: true })
}

export default function Tasks() {
  const { tasks } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const formData = new FormData()
    formData.append('_action', 'create')
    formData.append('title', newTask)
    formData.append('priority', priority)

    submit(formData, { method: 'post' })
    setNewTask('')
    setPriority('medium')
  }

  const handleToggleTask = (task: Task) => {
    const formData = new FormData()
    formData.append('_action', 'toggle')
    formData.append('id', task.id)
    formData.append('status', task.status)

    submit(formData, { method: 'post' })
  }

  const handleDeleteTask = (id: string) => {
    const formData = new FormData()
    formData.append('_action', 'delete')
    formData.append('id', id)

    submit(formData, { method: 'post' })
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {tasks.map((task: Task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleToggleTask(task)}
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

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa encontrada
          </div>
        )}
      </div>
    </div>
  )
} 