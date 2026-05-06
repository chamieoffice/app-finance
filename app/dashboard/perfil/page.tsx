'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function PerfilPage() {
  const router = useRouter()
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [averageExpense, setAverageExpense] = useState('')
  const [savingsGoal, setSavingsGoal] = useState('')
  const [investmentGoal, setInvestmentGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .maybeSingle()

      if (data) {
        setMonthlyIncome(data.monthly_income > 0 ? String(data.monthly_income) : '')
        setAverageExpense(data.average_monthly_expense > 0 ? String(data.average_monthly_expense) : '')
        setSavingsGoal(data.savings_goal > 0 ? String(data.savings_goal) : '')
        setInvestmentGoal(data.investment_goal > 0 ? String(data.investment_goal) : '')
      }
      setFetching(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('user_profiles').upsert({
      user_id: user.id,
      monthly_income: parseFloat(monthlyIncome),
      average_monthly_expense: parseFloat(averageExpense),
      savings_goal: parseFloat(savingsGoal || '0'),
      investment_goal: parseFloat(investmentGoal || '0'),
      onboarding_completed: true,
    })

    setLoading(false)

    if (error) {
      toast.error('Erro ao salvar perfil.')
      return
    }

    toast.success('Perfil atualizado!')
    router.push('/dashboard')
  }

  if (fetching) {
    return <p className="text-center text-gray-400 py-12">Carregando...</p>
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Perfil Financeiro</CardTitle>
          <CardDescription>
            Configure sua renda e metas para acompanhar seu orçamento mensal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income">Renda média mensal (R$)</Label>
              <Input
                id="income"
                type="number"
                step="0.01"
                min="0"
                placeholder="5000,00"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense">Gasto médio mensal (R$)</Label>
              <Input
                id="expense"
                type="number"
                step="0.01"
                min="0"
                placeholder="3500,00"
                value={averageExpense}
                onChange={(e) => setAverageExpense(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="savings">
                Meta de economia (R$){' '}
                <span className="text-gray-400 font-normal text-xs">— opcional</span>
              </Label>
              <Input
                id="savings"
                type="number"
                step="0.01"
                min="0"
                placeholder="500,00"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment">
                Meta de investimento (R$){' '}
                <span className="text-gray-400 font-normal text-xs">— opcional</span>
              </Label>
              <Input
                id="investment"
                type="number"
                step="0.01"
                min="0"
                placeholder="500,00"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
