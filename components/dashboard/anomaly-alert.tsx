import { AlertTriangle } from 'lucide-react'
import type { AnomalyAlert } from '@/lib/anomaly'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface AnomalyAlertBannerProps {
  alerts: AnomalyAlert[]
}

export function AnomalyAlertBanner({ alerts }: AnomalyAlertBannerProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">
              {alert.type === 'daily'
                ? 'Gasto diário acima do padrão'
                : 'Gasto semanal acima do padrão'}
            </p>
            <p className="text-yellow-700 mt-0.5">
              {alert.type === 'daily'
                ? `Hoje: ${formatCurrency(alert.currentAmount)} — +${(alert.variation * 100).toFixed(0)}% acima da média de ${formatCurrency(alert.averageAmount)}/dia (últimos 7 dias)`
                : `Esta semana: ${formatCurrency(alert.currentAmount)} — +${(alert.variation * 100).toFixed(0)}% acima da semana passada (${formatCurrency(alert.averageAmount)})`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
