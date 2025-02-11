# Painel TDAH

Painel pessoal para gerenciamento de tarefas, notas, metas e sessões Pomodoro, desenvolvido especialmente para pessoas com TDAH.

## Características

- Interface limpa e minimalista para reduzir distrações
- Sistema Pomodoro adaptado com notificações visuais e sonoras
- Gerenciamento de tarefas com prioridades e status
- Sistema de notas rápidas
- Definição e acompanhamento de metas
- Design responsivo e acessível

## Deploy na Vercel

1. Faça login na [Vercel](https://vercel.com)
2. Clique em "New Project"
3. Importe este repositório do GitHub
4. Configure as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SESSION_SECRET`
5. Clique em "Deploy"

## Configuração do Supabase

1. No dashboard do Supabase:
   - Vá em "Authentication" > "URL Configuration"
   - Configure "Site URL" para sua URL de produção (ex: `https://seu-app.vercel.app`)
   - Adicione a URL de redirecionamento: `https://seu-app.vercel.app/auth/callback`

2. Configuração de usuário:
   - Vá em "Authentication" > "Users"
   - Use "Invite User" para adicionar seu email
   - Defina sua senha através do email recebido

## Desenvolvimento Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. Configure as variáveis de ambiente no `.env.local`

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Tecnologias

- Remix.run (Framework web)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- Vercel (Hosting)
- React Icons
- Zustand (Gerenciamento de estado)

## Considerações de Acessibilidade

O projeto foi desenvolvido seguindo diretrizes específicas para TDAH:

- Interface limpa e organizada
- Feedback visual e sonoro
- Alto contraste e legibilidade
- Navegação intuitiva
- Suporte a atalhos de teclado
- Mensagens claras e objetivas

## Licença

MIT 