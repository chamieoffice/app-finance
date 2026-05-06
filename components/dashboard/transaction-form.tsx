'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, type Transaction, type TransactionType, type Category } from '@/types/database'
import { toast } from 'sonner'

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  onSuccess: () => void
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export function TransactionForm({ open, onOpenChange, transaction, onSuccess }: TransactionFormProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(getToday)
  const [type, setType] = useState<TransactionType>('despesa')
  const [category, setCategory] = useState<Category>('Outros')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description)
      setAmount(String(transaction.amount))
      setDate(transaction.date)
      setType(transaction.type)
      setCategory(transaction.category)
    } else {
      setDescription('')
      setAmount('')
      setDate(getToday())
      setType('despesa')
      setCategory('Outros')
    }
  }, [transaction, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      description: description.trim(),
      amount: parseFloat(amount),
      date,
      type,
      category,
      user_id: user.id,
    }

    let error
    if (transaction) {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          description: payload.description,
          amount: payload.amount,
          date: payload.date,
          type: payload.type,
          category: payload.category,
        })
        .eq('id', transaction.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('transactions').insert(payload)
      error = insertError
    }

    setLoading(false)

    if (error) {
      toast.error('Erro ao salvar transação.')
      return
    }

    toast.success(transaction ? 'Transação atualizada!' : 'Transação criada!')
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar transação' : 'Nova transação'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
