# Configurar Autenticação no Supabase

## 1. Configurar no Dashboard

1. No dashboard do Supabase
2. Authentication → Settings
3. Configurar:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/login`
   - Email Auth: Enabled
   - Email confirmations: Disabled (opcional)
   - Secure email change: Enabled
   - Custom SMTP server (opcional):
     - Host: seu-smtp
     - Port: 587
     - User: seu-usuario
     - Password: sua-senha
     - Sender name: Painel TDAH
     - Sender email: noreply@seudominio.com

## 2. Componentes de Autenticação

### Login Form

```typescript
// src/components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      setError('Erro ao fazer login. Verifique suas credenciais.')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
```

### Signup Form

```typescript
// src/components/auth/signup-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      router.push('/login?message=Verifique seu email para continuar')
    } catch (error) {
      setError('Erro ao criar conta. Tente novamente.')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  )
}
```

### Auth Layout

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Painel TDAH
          </h2>
        </div>
        {children}
      </div>
    </div>
  )
}
```

### Login Page

```typescript
// src/app/(auth)/login/page.tsx
import LoginForm from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        Não tem uma conta?{' '}
        <Link
          href="/signup"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Criar conta
        </Link>
      </p>
    </>
  )
}
```

### Signup Page

```typescript
// src/app/(auth)/signup/page.tsx
import SignUpForm from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <>
      <SignUpForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        Já tem uma conta?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Fazer login
        </Link>
      </p>
    </>
  )
}
```

### Auth Callback Handler

```typescript
// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

## 3. Hook de Autenticação

```typescript
// src/hooks/use-auth.ts
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [router, supabase])

  return {
    user,
    loading,
    signOut,
  }
}
```

## 4. Proteção de Rotas

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const publicRoutes = ['/login', '/signup', '/auth/callback']
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## Próximos Passos

1. [Implementar Componentes](./componentes.md)
2. [Configurar Store com Zustand](./configurar-store.md)
3. [Deploy na Vercel](./deploy.md) 