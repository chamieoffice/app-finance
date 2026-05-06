'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [averageExpense, setAverageExpense] = useState('')
  const [savingsGoal, setSavingsGoal] = useState('')
  const [investmentGoal, setInvestmentGoal] = useState('')
  const [loading, setLoading] = useState(false)

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
      toast.error('Erro ao salvar perfil. Tente novamente.')
      return
    }

    toast.success('Perfil financeiro salvo!')
    router.push('/dashboard')
  }

  async function handleSkip() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_profiles').upsert({
        user_id: user.id,
        monthly_income: 0,
        average_monthly_expense: 0,
        savings_goal: 0,
        investment_goal: 0,
        onboarding_completed: false,
      })
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Perfil Financeiro</CardTitle>
          <CardDescription>
            Configure seu perfil para receber análises personalizadas e acompanhar seu orçamento mensal.
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
                Meta de economia mensal (R$){' '}
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
                Meta de investimento mensal (R$){' '}
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
            <div className="space-y-2 pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar e começar'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={handleSkip}>
                Pular por agora
              </Button>
            </div>
          </form>
          <p className="text-xs text-center text-gray-400 mt-4">
            Você pode alterar isso depois em <strong>Perfil Financeiro</strong> no menu.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
