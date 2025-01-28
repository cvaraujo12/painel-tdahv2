import { useState } from 'react'
import { Link, Form } from '@remix-run/react'
import { FiMenu, FiX, FiHome, FiCheckSquare, FiFileText, FiTarget, FiClock, FiLogOut } from 'react-icons/fi'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

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
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <FiHome size={20} />
                <span>Dashboard</span>
              </Link>

              <Link 
                to="/dashboard/tasks"
                className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <FiCheckSquare size={20} />
                <span>Tarefas</span>
              </Link>

              <Link 
                to="/dashboard/notes"
                className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <FiFileText size={20} />
                <span>Notas</span>
              </Link>

              <Link 
                to="/dashboard/goals"
                className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <FiTarget size={20} />
                <span>Metas</span>
              </Link>

              <Link 
                to="/dashboard/pomodoro"
                className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-100 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <FiClock size={20} />
                <span>Pomodoro</span>
              </Link>
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
