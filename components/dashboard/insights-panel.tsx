'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'
import type { Transaction } from '@/types/database'

const MIN_TRANSACTIONS = 20

interface InsightsPanelProps {
  transactions: Transaction[]
}

export function InsightsPanel({ transactions }: InsightsPanelProps) {
  const [insights, setInsights] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canAnalyze = transactions.length >= MIN_TRANSACTIONS

  async function handleAnalyze() {
    setLoading(true)
    setError('')
    setInsights(null)

    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao gerar insights.')
        return
      }

      setInsights(data.insights)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Insights via IA
          </CardTitle>
          {!canAnalyze && (
            <p className="text-xs text-gray-400 mt-1">
              {transactions.length}/{MIN_TRANSACTIONS} transações para habilitar análise
            </p>
          )}
        </div>
        <Button
          size="sm"
          disabled={!canAnalyze || loading}
          onClick={handleAnalyze}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? 'Analisando...' : 'Analisar Agora'}
        </Button>
      </CardHeader>
      {(insights || error) && (
        <CardContent className="pt-0">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {insights && (
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border-t pt-4">
              {insights}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
