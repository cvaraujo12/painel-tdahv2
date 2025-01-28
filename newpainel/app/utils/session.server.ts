import { createCookieSessionStorage, redirect } from '@remix-run/node'

const sessionSecret = 'super-duper-s3cret'

const storage = createCookieSessionStorage({
  cookie: {
    name: 'painel_tdah_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
})

export async function createUserSession(accessToken: string, refreshToken: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('accessToken', accessToken)
  session.set('refreshToken', refreshToken)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export async function getUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return {
    accessToken: session.get('accessToken'),
    refreshToken: session.get('refreshToken'),
  }
}

export async function requireUser(request: Request) {
  const { accessToken } = await getUserSession(request)
  if (!accessToken) {
    throw redirect('/login')
  }
  return accessToken
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  })
}

export async function getUser(request: Request) {
  const userId = await getUserSession(request)
  if (!userId) return null

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user) return null

  return user
} 