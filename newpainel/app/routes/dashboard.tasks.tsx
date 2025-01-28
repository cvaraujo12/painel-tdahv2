import TaskList from './dashboard/components/task-list'

export default function TasksRoute() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Tarefas</h1>
      <TaskList />
    </div>
  )
} 