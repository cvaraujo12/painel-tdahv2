import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { supabase } from './supabase.server'

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set')
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'sb',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

export async function createUserSession(
  accessToken: string,
  refreshToken: string,
  redirectTo: string
) {
  const session = await sessionStorage.getSession()
  session.set('accessToken', accessToken)
  session.set('refreshToken', refreshToken)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}

export async function getUserSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const accessToken = session.get('accessToken')
  const refreshToken = session.get('refreshToken')

  if (!accessToken || !refreshToken) return null

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  
  if (error || !user) {
    // Token expirado ou inválido, tentar refresh
    const { data: { session: newSession }, error: refreshError } = 
      await supabase.auth.refreshSession({ refresh_token: refreshToken })
    
    if (refreshError || !newSession) return null

    // Atualizar sessão com novos tokens
    const cookieSession = await sessionStorage.getSession()
    cookieSession.set('accessToken', newSession.access_token)
    cookieSession.set('refreshToken', newSession.refresh_token)

    throw redirect(request.url, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(cookieSession),
      },
    })
  }

  return user
}

export async function requireUser(request: Request) {
  const user = await getUserSession(request)
  if (!user) {
    throw redirect('/login')
  }
  return user
}

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const accessToken = session.get('accessToken')

  if (accessToken) {
    await supabase.auth.signOut({ accessToken })
  }

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
} 