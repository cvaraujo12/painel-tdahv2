import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUser } from '~/utils/session.server'
import { supabase } from '~/utils/supabase.server'

interface TestResults {
  tasks: {
    count: number
    lastInserted: {
      id: string
      title: string
      status: string
      priority: string
      created_at: string
    } | null
  }
  notes: {
    count: number
    lastInserted: {
      id: string
      content: string
      created_at: string
    } | null
  }
  goals: {
    count: number
    lastInserted: {
      id: string
      title: string
      description: string
      deadline: string
      completed: boolean
      created_at: string
    } | null
  }
  pomodoros: {
    count: number
    lastInserted: {
      id: string
      duration: number
      type: string
      created_at: string
    } | null
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  
  try {
    // Buscar contagem atual
    const [tasksCount, notesCount, goalsCount, pomodorosCount] = await Promise.all([
      supabase.from('tasks').select('*', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('notes').select('*', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('goals').select('*', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('pomodoro_sessions').select('*', { count: 'exact' }).eq('user_id', user.id)
    ])

    // Inserir dados de teste
    const [taskInsert, noteInsert, goalInsert, pomodoroInsert] = await Promise.all([
      supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: 'Tarefa de Teste',
          status: 'pending',
          priority: 'medium'
        }])
        .select()
        .single(),
      
      supabase
        .from('notes')
        .insert([{
          user_id: user.id,
          content: 'Nota de teste'
        }])
        .select()
        .single(),
      
      supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          title: 'Meta de Teste',
          description: 'Descrição da meta de teste',
          deadline: new Date().toISOString().split('T')[0],
          completed: false
        }])
        .select()
        .single(),
      
      supabase
        .from('pomodoro_sessions')
        .insert([{
          user_id: user.id,
          duration: 25,
          type: 'focus'
        }])
        .select()
        .single()
    ])

    // Verificar se houve erros
    if (taskInsert.error) throw new Error(`Erro ao inserir tarefa: ${taskInsert.error.message}`)
    if (noteInsert.error) throw new Error(`Erro ao inserir nota: ${noteInsert.error.message}`)
    if (goalInsert.error) throw new Error(`Erro ao inserir meta: ${goalInsert.error.message}`)
    if (pomodoroInsert.error) throw new Error(`Erro ao inserir pomodoro: ${pomodoroInsert.error.message}`)

    const results: TestResults = {
      tasks: {
        count: tasksCount.count || 0,
        lastInserted: taskInsert.data
      },
      notes: {
        count: notesCount.count || 0,
        lastInserted: noteInsert.data
      },
      goals: {
        count: goalsCount.count || 0,
        lastInserted: goalInsert.data
      },
      pomodoros: {
        count: pomodorosCount.count || 0,
        lastInserted: pomodoroInsert.data
      }
    }

    return json({ success: true, results })
  } catch (error) {
    console.error('Erro no teste:', error)
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    })
  }
}

export default function TestDB() {
  const data = useLoaderData<typeof loader>()

  if (!data.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Teste de Sincronização do Banco de Dados</h1>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erro!</strong>
          <p className="block sm:inline"> {data.error}</p>
        </div>
      </div>
    )
  }

  const { results } = data

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Sincronização do Banco de Dados</h1>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
        <p className="font-bold">✅ Teste concluído com sucesso!</p>
        <p className="text-sm mt-1">Todos os testes de inserção e consulta foram realizados com sucesso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
            Tarefas
            <span className="text-sm font-normal text-gray-600">
              ({results.tasks.count} registros)
            </span>
          </h2>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results.tasks.lastInserted, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-600 flex items-center gap-2">
            Notas
            <span className="text-sm font-normal text-gray-600">
              ({results.notes.count} registros)
            </span>
          </h2>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results.notes.lastInserted, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-600 flex items-center gap-2">
            Metas
            <span className="text-sm font-normal text-gray-600">
              ({results.goals.count} registros)
            </span>
          </h2>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results.goals.lastInserted, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
            Pomodoros
            <span className="text-sm font-normal text-gray-600">
              ({results.pomodoros.count} registros)
            </span>
          </h2>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(results.pomodoros.lastInserted, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>* Os dados acima mostram os resultados dos testes de inserção mais recentes.</p>
        <p>* Os números entre parênteses indicam o total de registros em cada tabela.</p>
      </div>
    </div>
  )
} 