import type { Transaction } from '@/types/database'

export function exportToCsv(transactions: Transaction[], filename: string) {
  const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.type === 'receita' ? 'Receita' : 'Despesa',
    t.category,
    t.amount.toFixed(2).replace('.', ','),
  ])

  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
