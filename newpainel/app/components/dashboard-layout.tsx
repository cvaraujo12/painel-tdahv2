import { useEffect } from 'react'
import { useLoaderData } from '@remix-run/react'
import { supabase } from '~/utils/supabase.client'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useLoaderData<{ user: { id: string } }>()

  useEffect(() => {
    if (user?.id) {
      // Configurar listener do Supabase para atualizações em tempo real
      const tasksSubscription = supabase
        .channel('tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
          console.log('Mudança em tasks:', payload)
        })
        .subscribe()

      const notesSubscription = supabase
        .channel('notes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, (payload) => {
          console.log('Mudança em notes:', payload)
        })
        .subscribe()

      const goalsSubscription = supabase
        .channel('goals')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, (payload) => {
          console.log('Mudança em goals:', payload)
        })
        .subscribe()

      const pomodoroSubscription = supabase
        .channel('pomodoro')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pomodoro_sessions' }, (payload) => {
          console.log('Mudança em pomodoro:', payload)
        })
        .subscribe()

      // Cleanup
      return () => {
        tasksSubscription.unsubscribe()
        notesSubscription.unsubscribe()
        goalsSubscription.unsubscribe()
        pomodoroSubscription.unsubscribe()
      }
    }
  }, [user])

  return (
    <div className="flex-1">
      {children}
    </div>
  )
} 