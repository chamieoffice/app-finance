import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import type { Transaction } from '@/types/database'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getDateStr(date: Date) {
  return date.toISOString().split('T')[0]
}

function DeltaIndicator({ variation }: { variation: number | null }) {
  if (variation === null) {
    return <span className="text-xs text-gray-400">Sem dados</span>
  }
  if (variation === 0) {
    return (
      <span className="flex items-center text-xs text-gray-500">
        <Minus className="h-3 w-3 mr-1" /> Igual
      </span>
    )
  }
  const isUp = variation > 0
  return (
    <span className={`flex items-center text-xs font-medium ${isUp ? 'text-red-500' : 'text-green-500'}`}>
      {isUp ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
      {isUp ? '+' : ''}{(variation * 100).toFixed(1)}%
    </span>
  )
}

interface ComparisonCardsProps {
  recentTransactions: Transaction[]
}

export function ComparisonCards({ recentTransactions }: ComparisonCardsProps) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const dayBefore = new Date(today)
  dayBefore.setDate(today.getDate() - 2)

  const expenses = recentTransactions.filter((t) => t.type === 'despesa')

  function sumForDate(dateStr: string) {
    return expenses.filter((t) => t.date === dateStr).reduce((s, t) => s + t.amount, 0)
  }

  const yesterdayTotal = sumForDate(getDateStr(yesterday))
  const dayBeforeTotal = sumForDate(getDateStr(dayBefore))
  const d1Variation = dayBeforeTotal > 0 ? (yesterdayTotal - dayBeforeTotal) / dayBeforeTotal : null

  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - dayOfWeek + 1)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(thisWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1)

  const thisWeekTotal = expenses
    .filter((t) => t.date >= getDateStr(thisWeekStart) && t.date <= getDateStr(today))
    .reduce((s, t) => s + t.amount, 0)

  const lastWeekTotal = expenses
    .filter((t) => t.date >= getDateStr(lastWeekStart) && t.date <= getDateStr(lastWeekEnd))
    .reduce((s, t) => s + t.amount, 0)

  const weekVariation = lastWeekTotal > 0 ? (thisWeekTotal - lastWeekTotal) / lastWeekTotal : null

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Comparativo D-1</CardTitle>
          <p className="text-xs text-gray-400">Ontem vs anteontem</p>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-xl font-bold">{formatCurrency(yesterdayTotal)}</p>
          <div className="flex items-center gap-2">
            <DeltaIndicator variation={d1Variation} />
            <span className="text-xs text-gray-400">vs {formatCurrency(dayBeforeTotal)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Comparativo Semanal</CardTitle>
          <p className="text-xs text-gray-400">Semana atual vs anterior</p>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-xl font-bold">{formatCurrency(thisWeekTotal)}</p>
          <div className="flex items-center gap-2">
            <DeltaIndicator variation={weekVariation} />
            <span className="text-xs text-gray-400">vs {formatCurrency(lastWeekTotal)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
