import { useState } from 'react'
import { Link, Form, useLocation } from '@remix-run/react'
import { FiMenu, FiX, FiHome, FiCheckSquare, FiFileText, FiTarget, FiClock, FiLogOut, FiDatabase } from 'react-icons/fi'

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/dashboard/tasks', label: 'Tarefas', icon: FiCheckSquare },
  { to: '/dashboard/notes', label: 'Notas', icon: FiFileText },
  { to: '/dashboard/goals', label: 'Metas', icon: FiTarget },
  { to: '/dashboard/pomodoro', label: 'Pomodoro', icon: FiClock },
  { to: '/dashboard/test-db', label: 'Teste DB', icon: FiDatabase }
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Botão de menu sempre visível no topo */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 flex items-center px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          aria-label="Menu"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="ml-4 text-xl font-bold text-gray-800">Painel TDAH</h1>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 ease-in-out transform z-50
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.to
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 p-3 rounded-md hover:bg-gray-100 text-gray-700 ${
                      isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t">
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 w-full p-3 rounded-md hover:bg-red-50 text-red-600"
                onClick={() => setIsOpen(false)}
              >
                <FiLogOut size={20} />
                <span>Sair</span>
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Overlay para fechar o menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
} 
