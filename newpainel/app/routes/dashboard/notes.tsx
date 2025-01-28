import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSubmit } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import { supabase } from '~/utils/supabase.server'
import { useState } from 'react'
import { FiTrash2, FiEdit2 } from 'react-icons/fi'

interface Note {
  id: string
  content: string
  user_id: string
  created_at: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Erro ao carregar notas')
  }

  return json({ user, notes })
}

export async function action({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const action = formData.get('_action')

  if (action === 'create') {
    const content = formData.get('content')

    const { error } = await supabase
      .from('notes')
      .insert([{
        user_id: user.id,
        content
      }])

    if (error) throw error
  }

  if (action === 'update') {
    const id = formData.get('id')
    const content = formData.get('content')

    const { error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  if (action === 'delete') {
    const id = formData.get('id')

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  return json({ success: true })
}

export default function Notes() {
  const { notes } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    const formData = new FormData()
    
    if (editingNote) {
      formData.append('_action', 'update')
      formData.append('id', editingNote.id)
    } else {
      formData.append('_action', 'create')
    }
    
    formData.append('content', newNote)

    submit(formData, { method: 'post' })
    setNewNote('')
    setEditingNote(null)
  }

  const handleDelete = (id: string) => {
    const formData = new FormData()
    formData.append('_action', 'delete')
    formData.append('id', id)

    submit(formData, { method: 'post' })
  }

  const startEditing = (note: Note) => {
    setEditingNote(note)
    setNewNote(note.content)
  }

  const cancelEditing = () => {
    setEditingNote(null)
    setNewNote('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notas</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col gap-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Digite sua nota..."
            className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingNote ? 'Atualizar' : 'Adicionar'}
            </button>

            {editingNote && (
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
        {notes.map((note: Note) => (
          <div
            key={note.id}
            className="p-4 bg-white rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-start gap-4">
              <p className="whitespace-pre-wrap flex-1">{note.content}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => startEditing(note)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhuma nota encontrada
          </div>
        )}
      </div>
    </div>
  )
} 