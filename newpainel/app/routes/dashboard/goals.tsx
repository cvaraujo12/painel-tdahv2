import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSubmit } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import { supabase } from '~/utils/supabase.server'
import { useState } from 'react'
import { FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi'

interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  completed: boolean
  user_id: string
  created_at: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  
  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Erro ao carregar metas')
  }

  return json({ user, goals })
}

export async function action({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const action = formData.get('_action')

  if (action === 'create') {
    const title = formData.get('title')
    const description = formData.get('description')
    const deadline = formData.get('deadline')

    const { error } = await supabase
      .from('goals')
      .insert([{
        user_id: user.id,
        title,
        description,
        deadline,
        completed: false
      }])

    if (error) throw error
  }

  if (action === 'update') {
    const id = formData.get('id')
    const title = formData.get('title')
    const description = formData.get('description')
    const deadline = formData.get('deadline')

    const { error } = await supabase
      .from('goals')
      .update({ title, description, deadline })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  if (action === 'toggle') {
    const id = formData.get('id')
    const completed = formData.get('completed') === 'true' ? false : true

    const { error } = await supabase
      .from('goals')
      .update({ completed })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  if (action === 'delete') {
    const id = formData.get('id')

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  return json({ success: true })
}

export default function Goals() {
  const { goals } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim() || !formData.deadline) return

    const data = new FormData()
    
    if (editingGoal) {
      data.append('_action', 'update')
      data.append('id', editingGoal.id)
    } else {
      data.append('_action', 'create')
    }
    
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('deadline', formData.deadline)

    submit(data, { method: 'post' })
    setFormData({
      title: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0]
    })
    setEditingGoal(null)
  }

  const handleToggle = (goal: Goal) => {
    const data = new FormData()
    data.append('_action', 'toggle')
    data.append('id', goal.id)
    data.append('completed', goal.completed.toString())

    submit(data, { method: 'post' })
  }

  const handleDelete = (id: string) => {
    const data = new FormData()
    data.append('_action', 'delete')
    data.append('id', id)

    submit(data, { method: 'post' })
  }

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      deadline: goal.deadline
    })
  }

  const cancelEditing = () => {
    setEditingGoal(null)
    setFormData({
      title: '',
      description: '',
      deadline: new Date().toISOString().split('T')[0]
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Metas</h1>

      <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título da meta..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da meta..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prazo
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingGoal ? 'Atualizar' : 'Adicionar'}
            </button>

            {editingGoal && (
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {goals.map((goal: Goal) => (
          <div
            key={goal.id}
            className="p-6 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleToggle(goal)}
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${goal.completed 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : 'border-gray-300'
                  }`}
              >
                {goal.completed && <FiCheck className="w-4 h-4" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className={`text-lg font-semibold ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                    {goal.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(goal)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className={`mt-2 text-gray-600 ${goal.completed ? 'line-through' : ''}`}>
                  {goal.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>
                    Prazo: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                  <span>
                    Criado em: {new Date(goal.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma meta encontrada
          </div>
        )}
      </div>
    </div>
  )
} 