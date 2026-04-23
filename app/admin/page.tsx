import { createClient } from '@/lib/supabase/server'
import { Package, Users, AlertTriangle, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Buscar estatísticas
  const [
    { count: productsCount },
    { count: customersCount },
    { data: products },
    { data: sales },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*'),
    supabase.from('sales').select('*, customer:customers(name)'),
  ])

  // Calcular estatísticas
  const lowStockProducts = products?.filter(p => p.stock_quantity <= p.min_stock) || []
  const totalInventoryValue = products?.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0) || 0
  const totalPendingDebt = sales?.reduce((acc, s) => acc + (s.total_amount - s.paid_amount), 0) || 0
  const overdueSales = sales?.filter(s => {
    if (!s.due_date) return false
    return new Date(s.due_date) < new Date() && s.status !== 'paid'
  }) || []

  const stats = [
    {
      label: 'Total de Produtos',
      value: productsCount || 0,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products',
    },
    {
      label: 'Clientes Cadastrados',
      value: customersCount || 0,
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/customers',
    },
    {
      label: 'Estoque Baixo',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      href: '/admin/products?filter=low_stock',
    },
    {
      label: 'Débitos Pendentes',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendingDebt),
      icon: DollarSign,
      color: 'bg-red-500',
      href: '/admin/customers?filter=debtors',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral da sua loja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Produtos com Estoque Baixo
            </h2>
          </div>
          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum produto com estoque baixo</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{product.stock_quantity} un.</p>
                      <p className="text-xs text-gray-500">Mín: {product.min_stock}</p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <Link href="/admin/products?filter=low_stock" className="block text-center text-sm text-amber-600 hover:text-amber-700 mt-4">
                    Ver todos ({lowStockProducts.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Overdue Debts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              Débitos Atrasados
            </h2>
          </div>
          <div className="p-6">
            {overdueSales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum débito atrasado</p>
            ) : (
              <div className="space-y-3">
                {overdueSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{sale.customer?.name || 'Cliente não identificado'}</p>
                      <p className="text-sm text-gray-500" suppressHydrationWarning>
                        Vencimento: {new Date(sale.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount - sale.paid_amount)}
                      </p>
                      <p className="text-xs text-gray-500">em aberto</p>
                    </div>
                  </div>
                ))}
                {overdueSales.length > 5 && (
                  <Link href="/admin/customers?filter=debtors" className="block text-center text-sm text-red-600 hover:text-red-700 mt-4">
                    Ver todos ({overdueSales.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Value Card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100">Valor Total do Estoque</p>
            <p className="text-3xl font-bold mt-2">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInventoryValue)}
            </p>
            <p className="text-amber-100 mt-2 text-sm">
              {productsCount} produtos cadastrados
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
