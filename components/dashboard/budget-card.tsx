import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserProfile } from '@/types/database'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface BudgetCardProps {
  profile: UserProfile
  totalExpense: number
}

export function BudgetCard({ profile, totalExpense }: BudgetCardProps) {
  const spendingLimit = profile.monthly_income - profile.savings_goal - profile.investment_goal
  const percentage = spendingLimit > 0 ? Math.min((totalExpense / spendingLimit) * 100, 100) : 0
  const remaining = Math.max(spendingLimit - totalExpense, 0)
  const isOverBudget = totalExpense > spendingLimit && spendingLimit > 0

  const barColor =
    percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <Card className={isOverBudget ? 'border-red-200 bg-red-50' : percentage >= 70 ? 'border-yellow-200 bg-yellow-50' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">Orçamento do Mês</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">{percentage.toFixed(1)}% consumido</span>
          <span className="text-gray-500">Limite: {formatCurrency(spendingLimit)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {isOverBudget
            ? `Limite ultrapassado em ${formatCurrency(totalExpense - spendingLimit)}`
            : remaining > 0
              ? `Restam ${formatCurrency(remaining)} para gastar este mês`
              : 'Limite de gastos atingido!'}
        </p>
      </CardContent>
    </Card>
  )
}
