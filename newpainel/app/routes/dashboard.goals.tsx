import GoalList from './dashboard/components/goal-list'

export default function GoalsRoute() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Minhas Metas</h1>
      <GoalList />
    </div>
  )
} 