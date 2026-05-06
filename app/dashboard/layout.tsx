import Link from 'next/link'
import { LogoutButton } from '@/components/auth/logout-button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
            FinançasPessoais
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/perfil"
              className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              Perfil Financeiro
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
