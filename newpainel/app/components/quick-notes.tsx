import { useState } from 'react'

interface Note {
	id: string
	content: string
	createdAt: Date
}

interface QuickNotesProps {
	initialNotes?: Note[]
	onNoteAdd?: (note: Omit<Note, 'id'>) => void
	onNoteDelete?: (noteId: string) => void
	onNoteEdit?: (note: Note) => void
}

export function QuickNotes({
	initialNotes = [],
	onNoteAdd,
	onNoteDelete,
	onNoteEdit
}: QuickNotesProps) {
	const [notes, setNotes] = useState<Note[]>(initialNotes)
	const [newNote, setNewNote] = useState('')
	const [editingNote, setEditingNote] = useState<Note | null>(null)

	const handleAddNote = () => {
		if (!newNote.trim()) return

		const note = {
			id: crypto.randomUUID(),
			content: newNote,
			createdAt: new Date()
		}

		setNotes([note, ...notes])
		setNewNote('')
		if (onNoteAdd) {
			onNoteAdd({
				content: note.content,
				createdAt: note.createdAt
			})
		}
	}

	const handleDeleteNote = (noteId: string) => {
		setNotes(notes.filter((note) => note.id !== noteId))
		if (onNoteDelete) onNoteDelete(noteId)
	}

	const handleEditNote = (note: Note) => {
		setEditingNote(note)
		setNewNote(note.content)
	}

	const handleUpdateNote = () => {
		if (!editingNote || !newNote.trim()) return

		const updatedNotes = notes.map((note) =>
			note.id === editingNote.id
				? { ...note, content: newNote }
				: note
		)

		setNotes(updatedNotes)
		setEditingNote(null)
		setNewNote('')
		
		if (onNoteEdit) {
			onNoteEdit({ ...editingNote, content: newNote })
		}
	}

	const handleCancelEdit = () => {
		setEditingNote(null)
		setNewNote('')
	}

	return (
		<div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 border-2 border-transparent hover:border-primary-300 transition-all duration-300">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
				Notas Rápidas
			</h2>

			<div className="mt-4">
				<textarea
					value={newNote}
					onChange={(e) => setNewNote(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							editingNote ? handleUpdateNote() : handleAddNote()
						}
					}}
					placeholder={editingNote ? 'Edite sua nota...' : 'Digite sua nota aqui...'}
					className="w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-all duration-300"
					rows={3}
					aria-label={editingNote ? 'Editar nota' : 'Nova nota'}
				/>
				<div className="mt-2 flex gap-2">
					<button
						onClick={editingNote ? handleUpdateNote : handleAddNote}
						className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all duration-300"
						aria-label={editingNote ? 'Salvar edição' : 'Salvar nota'}
					>
						{editingNote ? 'Salvar Edição' : 'Salvar'}
					</button>
					{editingNote && (
						<button
							onClick={handleCancelEdit}
							className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
							aria-label="Cancelar edição"
						>
							Cancelar
						</button>
					)}
				</div>

				<div className="mt-6 space-y-4">
					{notes.map((note) => (
						<div
							key={note.id}
							className="group relative rounded-lg border-2 border-gray-200 p-4 hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-500 transition-all duration-300"
						>
							<p className="whitespace-pre-wrap text-gray-900 dark:text-white">
								{note.content}
							</p>
							<p className="mt-2 text-sm text-gray-500">
								{new Date(note.createdAt).toLocaleString('pt-BR', {
									day: '2-digit',
									month: '2-digit',
									year: '2-digit',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</p>
							
							{/* Botões de ação */}
							<div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<button
									onClick={() => handleEditNote(note)}
									className="rounded-md bg-primary-100 p-2 text-primary-600 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-primary-400 dark:hover:bg-gray-600"
									aria-label="Editar nota"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</button>
								<button
									onClick={() => handleDeleteNote(note.id)}
									className="rounded-md bg-red-100 p-2 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600"
									aria-label="Excluir nota"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
} 