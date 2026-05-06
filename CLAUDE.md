# FinançasPessoais App — CLAUDE.md

## Contexto do Projeto

App de gestão financeira pessoal com dashboard analítico e insights via IA.
Desenvolvido na Trilha Claude Code — Engenheiro Agêntico IA (NoCodeStartup).

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend/BaaS:** Supabase (PostgreSQL + Auth + Row Level Security)
- **IA:** Claude API (Anthropic) — modelo `claude-sonnet-4-6`
- **Deploy:** Vercel (CI/CD via GitHub)

## Estrutura de Arquivos

```
app/
  page.tsx                  → redirect para /auth/login
  layout.tsx                → root layout + Toaster
  auth/
    login/page.tsx          → login com Supabase Auth
    register/page.tsx       → cadastro → redirect para /onboarding
  onboarding/page.tsx       → perfil financeiro pós-cadastro (renda, metas)
  dashboard/
    layout.tsx              → header com nav (Perfil Financeiro | Sair)
    page.tsx                → dashboard principal (client component)
    perfil/page.tsx         → editar perfil financeiro
  api/
    insights/route.ts       → POST → chama Claude API e retorna insights

components/
  auth/
    logout-button.tsx       → logout client component
  dashboard/
    transaction-form.tsx    → dialog CRUD de transações
    category-chart.tsx      → gráfico donut por categoria (Recharts)
    comparison-cards.tsx    → cards D-1 e semanal com delta %
    budget-card.tsx         → barra de progresso do orçamento mensal
    anomaly-alert.tsx       → banner de alerta de anomalia
    insights-panel.tsx      → painel "Analisar Agora" + exibição Claude
  ui/                       → componentes shadcn/ui

lib/
  supabase/
    client.ts               → browser client (uso em client components)
    server.ts               → server client (uso em server components e API routes)
  anomaly.ts                → detecção de anomalias diária e semanal
  export.ts                 → exportação de transações para CSV
  utils.ts                  → cn() helper

types/
  database.ts               → Transaction, UserProfile, CATEGORIES, Database

middleware.ts               → proteção de rotas autenticadas
supabase/schema.sql         → SQL schema completo (rodar no Supabase SQL Editor)
```

## Variáveis de Ambiente

Criar `.env.local` na raiz (não vai pro Git):

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
ANTHROPIC_API_KEY=SUA_CHAVE_ANTHROPIC
```

## Status das Fases

- [x] **Fase 1** — Auth (login/cadastro), middleware, CRUD de transações, dashboard básico
- [x] **Fase 2** — Gráfico por categoria, cards D-1/semanal, busca, filtro categoria, exportação CSV
- [x] **Fase 3** — Onboarding, Perfil Financeiro, card de % orçamento consumido
- [x] **Fase 4** — Insights via Claude API (`/api/insights`), detecção de anomalias
- [ ] **Fase 5** — Conectar Supabase (rodar schema.sql), configurar .env.local, deploy na Vercel
- [ ] **Fase 6** — Integração Open Finance via Pluggy (planejada para evolução futura)

## Fluxo Principal

1. Cadastro → `/onboarding` (perfil financeiro ou pular)
2. Dashboard → filtro mês/ano, cards resumo, gráfico donut, comparativos D-1/semanal
3. Anomalias → detectadas automaticamente (>50% acima da média dos últimos 7/30 dias)
4. Orçamento → card de % consumido (visível se onboarding completo)
5. "Analisar Agora" → mín. 20 transações → Claude API gera insights
6. Exportar CSV → transações filtradas do período selecionado

## Banco de Dados (Supabase)

### Tabela `transactions`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK gerado automaticamente |
| user_id | uuid | FK → auth.users |
| description | text | Descrição da transação |
| amount | decimal(10,2) | Valor positivo |
| date | date | Data da transação |
| type | text | `'receita'` ou `'despesa'` |
| category | text | Uma das 9 categorias pré-definidas |
| created_at | timestamptz | Auto |

### Tabela `user_profiles`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| user_id | uuid | FK → auth.users (unique) |
| monthly_income | decimal | Renda média mensal |
| average_monthly_expense | decimal | Gasto médio mensal |
| savings_goal | decimal | Meta de economia mensal |
| investment_goal | decimal | Meta de investimento mensal |
| onboarding_completed | boolean | Controla exibição do card de orçamento |

### Categorias disponíveis
`Alimentação`, `Transporte`, `Moradia`, `Lazer`, `Saúde`, `Educação`, `Salário`, `Freelance`, `Outros`

## Decisões de Design

- **Dashboard é um client component** para facilitar re-fetch após CRUD sem Server Actions
- **Orçamento mensal** = `monthly_income - savings_goal - investment_goal`
- **Anomalia diária** = gasto de hoje > 150% da média diária dos últimos 7 dias (mín. 3 dias com dados)
- **Anomalia semanal** = gasto desta semana > 150% da semana anterior
- **Insights** = dados agregados por categoria e dia da semana, sem PII, enviados ao Claude
- **CSV** exporta com BOM UTF-8 para compatibilidade com Excel/Sheets em pt-BR

## Comandos

```bash
npm run dev     # desenvolvimento local
npm run build   # build de produção
npm run lint    # lint
```
