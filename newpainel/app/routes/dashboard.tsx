import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import { useEffect } from 'react'
import { useAppStore } from '~/store'
import { Sidebar } from '~/components/sidebar'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>()
  const fetchAllData = useAppStore(state => state.fetchAllData)

  useEffect(() => {
    if (user?.id) {
      fetchAllData()
    }
  }, [user?.id, fetchAllData])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
} 