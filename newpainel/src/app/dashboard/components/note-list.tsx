'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Note = Database['public']['Tables']['notes']['Row']

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Carregar notas
  const loadNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar nota
  const addNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ content: newNote.trim() }])
        .select()
        .single()

      if (error) throw error
      setNotes(prev => [data, ...prev])
      setNewNote('')
    } catch (error) {
      console.error('Erro ao adicionar nota:', error)
    }
  }

  // Deletar nota
  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Erro ao deletar nota:', error)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addNote} className="flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Nova nota..."
          className="flex-1 rounded-md border p-2 min-h-[100px]"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 h-fit"
        >
          Adicionar
        </button>
      </form>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {notes.map(note => (
          <div
            key={note.id}
            className="bg-yellow-50 p-4 rounded-md shadow relative group"
          >
            <button
              onClick={() => deleteNote(note.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Deletar
            </button>
            <p className="whitespace-pre-wrap">{note.content}</p>
            <span className="text-xs text-gray-500 mt-2 block">
              {new Date(note.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center text-gray-500">Carregando...</div>
      )}
    </div>
  )
} 