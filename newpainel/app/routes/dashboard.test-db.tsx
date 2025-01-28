import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { supabase } from '~/lib/supabase.server'
import { requireUser } from '~/utils/session.server'
import type { Task, Note, Goal, PomodoroSession } from '~/lib/supabase.server'

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request)
  
  try {
    // Teste de Tasks
    const testTask = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        title: 'Tarefa de Teste',
        description: 'Descrição da tarefa de teste',
        status: 'pending',
        priority: 'medium'
      }])
      .select()
      .single()

    // Teste de Notes
    const testNote = await supabase
      .from('notes')
      .insert([{
        user_id: user.id,
        content: 'Nota de teste para verificar a sincronização'
      }])
      .select()
      .single()

    // Teste de Goals
    const testGoal = await supabase
      .from('goals')
      .insert([{
        user_id: user.id,
        title: 'Meta de Teste',
        description: 'Descrição da meta de teste',
        status: 'in_progress'
      }])
      .select()
      .single()

    // Teste de Pomodoro
    const testPomodoro = await supabase
      .from('pomodoro_sessions')
      .insert([{
        user_id: user.id,
        start_time: new Date().toISOString(),
        type: 'focus'
      }])
      .select()
      .single()

    // Buscar todos os dados inseridos
    const [tasks, notes, goals, pomodoros] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('notes').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
      supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id)
    ])

    return json({
      success: true,
      data: {
        tasks: tasks.data,
        notes: notes.data,
        goals: goals.data,
        pomodoros: pomodoros.data,
        testResults: {
          task: testTask.data,
          note: testNote.data,
          goal: testGoal.data,
          pomodoro: testPomodoro.data
        }
      }
    })
  } catch (error) {
    console.error('Erro no teste:', error)
    return json({
      success: false,
      error: error.message
    })
  }
}

export default function TestDB() {
  const { success, data, error } = useLoaderData<typeof loader>()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste de Sincronização do Banco de Dados</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Erro:</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="space-y-6">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-semibold">✅ Teste concluído com sucesso!</p>
            <p className="text-sm mt-1">Todos os testes de inserção e consulta foram realizados com sucesso.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-blue-600">
                Tarefas ({data.tasks.length})
              </h2>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.testResults.task, null, 2)}
                </pre>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-green-600">
                Notas ({data.notes.length})
              </h2>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.testResults.note, null, 2)}
                </pre>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-purple-600">
                Metas ({data.goals.length})
              </h2>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.testResults.goal, null, 2)}
                </pre>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-orange-600">
                Pomodoros ({data.pomodoros.length})
              </h2>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(data.testResults.pomodoro, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>* Os dados acima mostram os resultados dos testes de inserção mais recentes.</p>
            <p>* Os números entre parênteses indicam o total de registros em cada tabela.</p>
          </div>
        </div>
      )}
    </div>
  )
} 