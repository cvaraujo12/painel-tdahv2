import { Outlet } from '@remix-run/react'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { requireUser } from '~/utils/session.server'
import Sidebar from '~/components/sidebar'
import DashboardLayout from '~/components/dashboard-layout'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <DashboardLayout>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </DashboardLayout>
    </div>
  )
} 