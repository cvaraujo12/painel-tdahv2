# Criar Tabelas no Supabase

## 1. Acessar SQL Editor

1. No dashboard do Supabase
2. Menu lateral → SQL Editor
3. Novo script SQL

## 2. Script de Criação

```sql
-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- Configurar atualização automática de timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tabela de Tasks
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')),
  user_id uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger handle_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

-- Tabela de Notes
create table public.notes (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger handle_notes_updated_at
  before update on public.notes
  for each row
  execute function public.handle_updated_at();

-- Tabela de Goals
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  completed boolean default false,
  period text check (period in ('daily', 'weekly', 'monthly')),
  user_id uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger handle_goals_updated_at
  before update on public.goals
  for each row
  execute function public.handle_updated_at();

-- Tabela de Pomodoro Sessions
create table public.pomodoro_sessions (
  id uuid default uuid_generate_v4() primary key,
  duration integer not null,
  completed boolean default false,
  user_id uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

-- Habilitar RLS em todas as tabelas
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.goals enable row level security;
alter table public.pomodoro_sessions enable row level security;

-- Políticas para Tasks
create policy "Usuários podem ver suas próprias tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Políticas para Notes
create policy "Usuários podem ver suas próprias notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- Políticas para Goals
create policy "Usuários podem ver suas próprias goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Políticas para Pomodoro Sessions
create policy "Usuários podem ver suas próprias sessions"
  on public.pomodoro_sessions for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias sessions"
  on public.pomodoro_sessions for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias sessions"
  on public.pomodoro_sessions for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias sessions"
  on public.pomodoro_sessions for delete
  using (auth.uid() = user_id);
```

## 3. Verificar Criação

```sql
-- Listar tabelas
select table_name 
from information_schema.tables 
where table_schema = 'public';

-- Verificar políticas
select * 
from pg_policies 
where schemaname = 'public';

-- Verificar triggers
select 
    trigger_schema,
    trigger_name,
    event_manipulation,
    action_statement
from information_schema.triggers
where trigger_schema = 'public';
```

## 4. Testar Inserções

```sql
-- Criar usuário de teste (via interface do Supabase)
-- Authentication → Users → New User

-- Inserir task de teste
insert into public.tasks (
  title,
  priority,
  user_id
) values (
  'Primeira tarefa de teste',
  'medium',
  'id-do-usuario-criado'
);

-- Verificar inserção
select * from public.tasks;
```

## Próximos Passos

1. [Configurar Autenticação](./configurar-auth.md)
2. [Implementar Componentes](./componentes.md)
3. [Configurar Store com Zustand](./configurar-store.md) 