export type TransactionType = 'receita' | 'despesa'

export type Category =
  | 'Alimentação'
  | 'Transporte'
  | 'Moradia'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Salário'
  | 'Freelance'
  | 'Outros'

export const CATEGORIES: Category[] = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Educação',
  'Salário',
  'Freelance',
  'Outros',
]

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  date: string
  type: TransactionType
  category: Category
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  monthly_income: number
  average_monthly_expense: number
  savings_goal: number
  investment_goal: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at'>
        Update: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
