# Setup Inicial do Supabase para Painel TDAH

## 1. Criar Projeto Next.js

```bash
# Criar novo projeto Next.js com TypeScript
npx create-next-app@latest painel-tdah --typescript --tailwind --eslint

# Entrar no diretório
cd painel-tdah

# Instalar dependências do Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

## 2. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login com GitHub
3. Clique em "New Project"
4. Configure:
   - Nome: `painel-tdah`
   - Banco: Criar novo
   - Região: São Paulo
   - Pricing: Free tier
5. Guarde as credenciais:
   - Project URL
   - anon/public key
   - service_role key (manter segura!)

## 3. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.local
touch .env.local
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

## 4. Estrutura de Diretórios

```bash
mkdir -p src/{components,hooks,lib,types,store,styles}
```

```
painel-tdah/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── notes/
│   │   ├── goals/
│   │   └── pomodoro/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   └── layout/
│   ├── hooks/
│   ├── lib/
│   ├── store/
│   ├── styles/
│   └── types/
├── public/
└── package.json
```

## 5. Configuração TypeScript

```typescript
// src/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          completed?: boolean
          priority: 'low' | 'medium' | 'high'
        }
        Update: {
          title?: string
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
        }
      }
      notes: {
        Row: {
          id: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          content: string
        }
        Update: {
          content?: string
        }
      }
      goals: {
        Row: {
          id: string
          title: string
          completed: boolean
          period: 'daily' | 'weekly' | 'monthly'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          completed?: boolean
          period: 'daily' | 'weekly' | 'monthly'
        }
        Update: {
          title?: string
          completed?: boolean
          period?: 'daily' | 'weekly' | 'monthly'
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          duration: number
          completed: boolean
          user_id: string
          created_at: string
        }
        Insert: {
          duration: number
          completed?: boolean
        }
        Update: {
          completed?: boolean
        }
      }
    }
  }
}
```

## 6. Cliente Supabase

```typescript
// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export const createClient = () => 
  createClientComponentClient<Database>()
```

## 7. Middleware de Autenticação

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Rotas públicas
  const publicRoutes = ['/login', '/signup']
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

## 8. Provider do Supabase

```typescript
// src/components/providers/supabase-provider.tsx
'use client'

import { createContext, useContext, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() => createClient())

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}
```

## 9. Layout Principal

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'
import SupabaseProvider from '@/components/providers/supabase-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Painel TDAH',
  description: 'Painel de gestão para pessoas com TDAH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
```

## Próximos Passos

1. [Criar Tabelas no Banco](./criar-tabelas.md)
2. [Configurar Autenticação](./configurar-auth.md)
3. [Implementar Componentes](./componentes.md)
4. [Configurar Store com Zustand](./configurar-store.md)
5. [Deploy na Vercel](./deploy.md) 