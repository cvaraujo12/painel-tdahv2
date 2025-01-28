'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Note = Database['public']['Tables']['notes']['Row']
type NoteColor = 'yellow' | 'blue' | 'green' | 'purple' | 'red'

const MAX_NOTE_LENGTH = 280 // Limite de caracteres por nota
const MAX_VISIBLE_NOTES = 6 // Limite de notas visíveis por vez

const COLORS: Record<NoteColor, { bg: string, border: string, text: string }> = {
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800' },
  green: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-800' },
  red: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800' }
}

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow')
  const [loading, setLoading] = useState(false)
  const [isImportant, setIsImportant] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const supabase = createClient()

  // Carregar notas
  const loadNotes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  // Adicionar nota
  const addNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ 
          content: newNote.trim(),
          color: selectedColor,
          is_important: isImportant
        }])
        .select()
        .single()

      if (error) throw error
      setNotes(prev => [data, ...prev])
      setNewNote('')
      setIsImportant(false)
      
      // Feedback sonoro
      const audio = new Audio('/sounds/success.mp3')
      audio.play()
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

  // Alternar importância
  const toggleImportance = async (note: Note) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_important: !note.is_important })
        .eq('id', note.id)

      if (error) throw error
      setNotes(prev =>
        prev.map(n =>
          n.id === note.id ? { ...n, is_important: !n.is_important } : n
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar nota:', error)
    }
  }

  // Filtrar notas visíveis
  const visibleNotes = showAll ? notes : notes.slice(0, MAX_VISIBLE_NOTES)

  return (
    <div className="space-y-4">
      <form onSubmit={addNote} className="space-y-3">
        <div className="relative">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Nova nota..."
            className={`w-full rounded-lg border p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 ${COLORS[selectedColor].bg}`}
            maxLength={MAX_NOTE_LENGTH}
          />
          <div className="absolute bottom-2 right-2 text-sm text-gray-500">
            {newNote.length}/{MAX_NOTE_LENGTH}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            {(Object.keys(COLORS) as NoteColor[]).map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full ${COLORS[color].bg} ${
                  selectedColor === color ? `ring-2 ring-offset-2 ring-${color}-500` : ''
                }`}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Marcar como importante
          </label>

          <button
            type="submit"
            className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </form>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Notas ({notes.length})
        </h3>
        {notes.length > MAX_VISIBLE_NOTES && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {showAll ? 'Mostrar Menos' : 'Mostrar Todas'}
          </button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {visibleNotes.map(note => (
          <div
            key={note.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
              COLORS[note.color as NoteColor].bg
            } ${COLORS[note.color as NoteColor].border} ${
              note.is_important ? 'transform hover:-translate-y-1' : ''
            }`}
          >
            {note.is_important && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                ⭐
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <button
                onClick={() => toggleImportance(note)}
                className="text-gray-500 hover:text-gray-700"
              >
                {note.is_important ? '📌' : '📍'}
              </button>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
              >
                ✕
              </button>
            </div>
            <p className="whitespace-pre-wrap text-gray-800">
              {note.content}
            </p>
            <span className="text-xs text-gray-500 mt-2 block">
              {new Date(note.created_at).toLocaleDateString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
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