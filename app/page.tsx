import Link from 'next/link'
import { Armchair, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <Armchair className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Móveis Paraíso</span>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Painel Admin
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl text-center">
          <div className="w-24 h-24 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Armchair className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            Sistema de Gestão
            <span className="text-amber-600"> Móveis Paraíso</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto text-pretty">
            Controle completo do seu estoque, clientes e vendas. 
            Gerencie sua loja de móveis de forma simples e eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium text-lg shadow-lg shadow-amber-600/20"
            >
              Acessar Painel
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/60 backdrop-blur rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Controle de Estoque</h3>
              <p className="text-gray-600 text-sm">Gerencie produtos, quantidades e receba alertas de estoque baixo.</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestão de Clientes</h3>
              <p className="text-gray-600 text-sm">Cadastre clientes e acompanhe débitos e pagamentos pendentes.</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-xl p-6 text-left">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Painel SEO</h3>
              <p className="text-gray-600 text-sm">Otimize seu site para aparecer melhor nos mecanismos de busca.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Móveis Paraíso. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
