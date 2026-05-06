import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Transaction } from '@/types/database'

function aggregateForInsights(transactions: Transaction[]) {
  const expenses = transactions.filter((t) => t.type === 'despesa')
  const income = transactions.filter((t) => t.type === 'receita')

  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const byDayOfWeek = expenses.reduce((acc, t) => {
    const day = dayNames[new Date(t.date + 'T12:00:00').getDay()]
    acc[day] = (acc[day] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  const weekendTotal = expenses
    .filter((t) => [0, 6].includes(new Date(t.date + 'T12:00:00').getDay()))
    .reduce((s, t) => s + t.amount, 0)

  const weekdayTotal = expenses
    .filter((t) => ![0, 6].includes(new Date(t.date + 'T12:00:00').getDay()))
    .reduce((s, t) => s + t.amount, 0)

  return {
    totalTransactions: transactions.length,
    totalExpenses: expenses.reduce((s, t) => s + t.amount, 0),
    totalIncome: income.reduce((s, t) => s + t.amount, 0),
    expensesByCategory: byCategory,
    expensesByDayOfWeek: byDayOfWeek,
    weekendVsWeekday: { weekend: weekendTotal, weekday: weekdayTotal },
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { transactions } = await request.json() as { transactions: Transaction[] }

  if (!transactions || transactions.length < 20) {
    return Response.json(
      { error: 'Mínimo de 20 transações necessário para análise.' },
      { status: 400 }
    )
  }

  const aggregated = aggregateForInsights(transactions)

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: 'Você é um consultor financeiro pessoal objetivo e direto. Responda sempre em português, com insights acionáveis e sem jargão excessivo.',
    messages: [
      {
        role: 'user',
        content: `Analise os dados financeiros abaixo e gere de 3 a 5 insights estratégicos numerados.

Dados (agregados, sem informações pessoais identificáveis):
${JSON.stringify(aggregated, null, 2)}

Cubra obrigatoriamente:
1. Quais categorias consomem mais orçamento e se isso parece adequado
2. Padrões temporais: dias da semana com maior gasto, diferença entre fim de semana e dias úteis
3. Pelo menos uma boa prática acionável com base nos padrões observados

Seja específico, cite valores quando relevante, e escreva de forma direta.`,
      },
    ],
  })

  const insights = message.content[0].type === 'text' ? message.content[0].text : ''
  return Response.json({ insights })
}
