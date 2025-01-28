'use client'

import { useState, useEffect } from 'react'
import { useStore } from '~/store'
import { Note } from '~/types'

export default function NoteList() {
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const { 
    notes, 
    addNote, 
    deleteNote, 
    editNote,
    isLoading,
    error,
    syncWithSupabase 
  } = useStore()

  useEffect(() => {
    syncWithSupabase()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      if (editingNote) {
        await editNote(editingNote.id, {
          content: newNote
        })
        setEditingNote(null)
      } else {
        const note: Note = {
          id: Date.now().toString(),
          content: newNote,
          createdAt: new Date().toISOString()
        }
        await addNote(note)
      }

      setNewNote('')
    } catch (err) {
      console.error('Erro ao salvar nota:', err)
    }
  }

  const startEditing = (note: Note) => {
    setEditingNote(note)
    setNewNote(note.content)
  }

  const cancelEditing = () => {
    setEditingNote(null)
    setNewNote('')
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id)
    } catch (err) {
      console.error('Erro ao deletar nota:', err)
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        Erro ao carregar notas: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Digite sua nota..."
            className="w-full p-2 border rounded min-h-[100px] sm:min-h-[80px] resize-y"
            disabled={isLoading}
          />
        </div>
        <div className="flex sm:flex-col gap-2">
          <button 
            type="submit"
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : editingNote ? 'Atualizar' : 'Adicionar'}
          </button>
          {editingNote && (
            <button
              type="button"
              onClick={cancelEditing}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {isLoading && !notes.length ? (
        <div className="p-4 text-center text-gray-500">
          Carregando notas...
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div 
              key={note.id}
              className="p-4 bg-white rounded shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                <p className="text-gray-800 whitespace-pre-wrap flex-1 min-w-0 break-words">
                  {note.content}
                </p>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => startEditing(note)}
                    className="text-blue-500 hover:text-blue-600 disabled:opacity-50 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50 whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 