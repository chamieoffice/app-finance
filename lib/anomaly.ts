import type { Transaction } from '@/types/database'

export interface AnomalyAlert {
  type: 'daily' | 'weekly'
  variation: number
  currentAmount: number
  averageAmount: number
}

function getDateStr(date: Date) {
  return date.toISOString().split('T')[0]
}

export function detectAnomalies(recentTransactions: Transaction[]): AnomalyAlert[] {
  const today = new Date()
  const todayStr = getDateStr(today)
  const alerts: AnomalyAlert[] = []

  const expenses = recentTransactions.filter((t) => t.type === 'despesa')

  const byDate = expenses.reduce((acc, t) => {
    acc[t.date] = (acc[t.date] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  // Daily anomaly: today vs average of last 7 days (excluding today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (i + 1))
    return getDateStr(d)
  })

  const dailyAmounts = last7Days.map((d) => byDate[d] || 0)
  const daysWithData = dailyAmounts.filter((a) => a > 0).length

  if (daysWithData >= 3) {
    const avgDaily = dailyAmounts.reduce((s, v) => s + v, 0) / 7
    const todayAmount = byDate[todayStr] || 0
    if (avgDaily > 0 && todayAmount > avgDaily * 1.5) {
      alerts.push({
        type: 'daily',
        variation: (todayAmount - avgDaily) / avgDaily,
        currentAmount: todayAmount,
        averageAmount: avgDaily,
      })
    }
  }

  // Weekly anomaly: this week vs last week
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay()
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - dayOfWeek + 1)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(thisWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1)

  const thisWeekTotal = expenses
    .filter((t) => t.date >= getDateStr(thisWeekStart) && t.date <= todayStr)
    .reduce((s, t) => s + t.amount, 0)

  const lastWeekTotal = expenses
    .filter((t) => t.date >= getDateStr(lastWeekStart) && t.date <= getDateStr(lastWeekEnd))
    .reduce((s, t) => s + t.amount, 0)

  if (lastWeekTotal > 0 && thisWeekTotal > lastWeekTotal * 1.5) {
    alerts.push({
      type: 'weekly',
      variation: (thisWeekTotal - lastWeekTotal) / lastWeekTotal,
      currentAmount: thisWeekTotal,
      averageAmount: lastWeekTotal,
    })
  }

  return alerts
}
