import NoteList from './dashboard/components/note-list'

export default function NotesRoute() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Notas</h1>
      <NoteList />
    </div>
  )
} 