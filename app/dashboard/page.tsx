'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, UserProfile } from '@/types/database'
import { CATEGORIES } from '@/types/database'
import { TransactionForm } from '@/components/dashboard/transaction-form'
import { CategoryChart } from '@/components/dashboard/category-chart'
import { ComparisonCards } from '@/components/dashboard/comparison-cards'
import { BudgetCard } from '@/components/dashboard/budget-card'
import { AnomalyAlertBanner } from '@/components/dashboard/anomaly-alert'
import { InsightsPanel } from '@/components/dashboard/insights-panel'
import { detectAnomalies } from '@/lib/anomaly'
import { exportToCsv } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Wallet, Download, Search } from 'lucide-react'
import { toast } from 'sonner'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export default function DashboardPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const today = new Date()
    const supabase = createClient()

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    const sixtyDaysAgo = new Date(today)
    sixtyDaysAgo.setDate(today.getDate() - 60)
    const recentStart = sixtyDaysAgo.toISOString().split('T')[0]

    const [monthResult, recentResult, profileResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate)
        .lt('date', endDate)
        .order('date', { ascending: false }),
      supabase
        .from('transactions')
        .select('*')
        .gte('date', recentStart)
        .order('date', { ascending: false }),
      supabase
        .from('user_profiles')
        .select('*')
        .maybeSingle(),
    ])

    if (monthResult.error) {
      toast.error('Erro ao carregar transações.')
    } else {
      setTransactions(monthResult.data ?? [])
    }

    if (!recentResult.error) setRecentTransactions(recentResult.data ?? [])
    if (!profileResult.error) setProfile(profileResult.data)

    setLoading(false)
  }, [month, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      toast.error('Erro ao excluir transação.')
    } else {
      toast.success('Transação excluída.')
      fetchData()
    }
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  function handleNew() {
    setEditingTransaction(null)
    setFormOpen(true)
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = search === '' || t.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const anomalies = detectAnomalies(recentTransactions)

  const currentYear = now.getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  function handleExportCsv() {
    const filename = `financas-${MONTHS[month - 1].toLowerCase()}-${year}.csv`
    exportToCsv(filteredTransactions, filename)
    toast.success('CSV exportado!')
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-500">Gerencie suas finanças pessoais</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nova transação
            </Button>
          </div>
        </div>

        {/* Anomaly alerts */}
        {anomalies.length > 0 && <AnomalyAlertBanner alerts={anomalies} />}

        {/* Budget card */}
        {profile?.onboarding_completed && (
          <BudgetCard profile={profile} totalExpense={totalExpense} />
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Despesa Total</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Saldo do Mês</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryChart transactions={transactions} />
          <ComparisonCards recentTransactions={recentTransactions} />
        </div>

        {/* AI Insights */}
        <InsightsPanel transactions={recentTransactions} />

        {/* Transaction list */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">
                Transações — {MONTHS[month - 1]} {year}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'itens'})
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={filteredTransactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-400 py-8">Carregando...</p>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-3">
                  {transactions.length === 0
                    ? 'Nenhuma transação neste período.'
                    : 'Nenhuma transação encontrada com esses filtros.'}
                </p>
                {transactions.length === 0 && (
                  <Button variant="outline" size="sm" onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar primeira transação
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3 font-medium">Data</th>
                      <th className="pb-3 font-medium">Descrição</th>
                      <th className="pb-3 font-medium hidden sm:table-cell">Categoria</th>
                      <th className="pb-3 font-medium hidden sm:table-cell">Tipo</th>
                      <th className="pb-3 font-medium text-right">Valor</th>
                      <th className="pb-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-3 text-gray-600 whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="py-3 font-medium max-w-48 truncate pr-4">{t.description}</td>
                        <td className="py-3 hidden sm:table-cell">
                          <Badge variant="secondary" className="text-xs">{t.category}</Badge>
                        </td>
                        <td className="py-3 hidden sm:table-cell">
                          <span className={`text-xs font-medium ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'receita' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className={`py-3 text-right font-semibold whitespace-nowrap ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                          {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.amount)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(t)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(t.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editingTransaction}
        onSuccess={fetchData}
      />
    </>
  )
}
