'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CustomerWithDebt, Sale } from '@/lib/types'
import { 
  Plus, 
  Search, 
  Users,
  Edit2, 
  Trash2, 
  X,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Eye
} from 'lucide-react'

interface CustomersClientProps {
  initialCustomers: CustomerWithDebt[]
  filter?: string
}

export function CustomersClient({ initialCustomers, filter }: CustomersClientProps) {
  const [customers, setCustomers] = useState<CustomerWithDebt[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithDebt | null>(null)
  const [customerSales, setCustomerSales] = useState<Sale[]>([])
  const [editingCustomer, setEditingCustomer] = useState<CustomerWithDebt | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.cpf?.includes(search)
  )

const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    
    setDeleting(id)
    try {
      const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' })
      
      if (res.ok) {
        setCustomers(customers.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
    setDeleting(null)
  }

  const handleSave = async (data: Partial<CustomerWithDebt>) => {
    setLoading(true)
    setError(null)
    
    try {
      if (editingCustomer) {
        const res = await fetch('/api/customers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCustomer.id, ...data }),
        })
        
        const result = await res.json()
        
        if (!res.ok) {
          setError(result.error || 'Erro ao atualizar cliente')
          setLoading(false)
          return
        }
        
        setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...result, total_debt: editingCustomer.total_debt, overdue_sales: editingCustomer.overdue_sales } : c))
      } else {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        const result = await res.json()
        
        if (!res.ok) {
          setError(result.error || 'Erro ao criar cliente')
          setLoading(false)
          return
        }
        
        setCustomers([{ ...result, total_debt: 0, overdue_sales: 0 }, ...customers])
      }
      
      setLoading(false)
      setShowModal(false)
      setEditingCustomer(null)
    } catch (err) {
      console.error('Erro:', err)
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  const handleViewDebt = async (customer: CustomerWithDebt) => {
    setSelectedCustomer(customer)
    setShowDebtModal(true)
    
    const supabase = createClient()
    const { data } = await supabase
      .from('sales')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
    
    setCustomerSales(data || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">
            {filter === 'debtors' ? 'Clientes com débitos pendentes' : 'Gerencie seus clientes'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, email, telefone ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum cliente encontrado</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-semibold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    {customer.cpf && (
                      <p className="text-sm text-gray-500">CPF: {customer.cpf}</p>
                    )}
                  </div>
                </div>
                {customer.overdue_sales > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                    Atrasado
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {customer.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {customer.phone}
                  </p>
                )}
                {customer.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {customer.email}
                  </p>
                )}
                {(customer.city || customer.state) && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[customer.city, customer.state].filter(Boolean).join(' - ')}
                  </p>
                )}
              </div>

              {/* Debt Info */}
              {customer.total_debt > 0 && (
                <div className="p-3 bg-red-50 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Débito Total</span>
                    <span className="font-bold text-red-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.total_debt)}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                {customer.total_debt > 0 && (
                  <button
                    onClick={() => handleViewDebt(customer)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Débitos
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingCustomer(customer)
                    setShowModal(true)
                  }}
                  className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  disabled={deleting === customer.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting === customer.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowModal(false)
            setEditingCustomer(null)
            setError(null)
          }}
          onSave={handleSave}
          loading={loading}
          error={error}
        />
      )}

      {/* Debt Modal */}
      {showDebtModal && selectedCustomer && (
        <DebtModal
          customer={selectedCustomer}
          sales={customerSales}
          onClose={() => {
            setShowDebtModal(false)
            setSelectedCustomer(null)
            setCustomerSales([])
          }}
        />
      )}
    </div>
  )
}

function CustomerModal({
  customer,
  onClose,
  onSave,
  loading,
  error,
}: {
  customer: CustomerWithDebt | null
  onClose: () => void
  onSave: (data: Partial<CustomerWithDebt>) => void
  loading: boolean
  error: string | null
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    cpf: customer?.cpf || '',
    address: customer?.address || '',
    city: customer?.city || '',
    state: customer?.state || '',
    notes: customer?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      cpf: formData.cpf || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      notes: formData.notes || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-gray-900"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {customer ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DebtModal({
  customer,
  sales,
  onClose,
}: {
  customer: CustomerWithDebt
  sales: Sale[]
  onClose: () => void
}) {
  const pendingSales = sales.filter(s => s.status !== 'paid')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Débitos de {customer.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total em aberto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(customer.total_debt)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {pendingSales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum débito pendente</p>
          ) : (
            <div className="space-y-4">
              {pendingSales.map((sale) => {
                const remaining = sale.total_amount - sale.paid_amount
                const isOverdue = sale.due_date && new Date(sale.due_date) < new Date()
                
                return (
                  <div 
                    key={sale.id} 
                    className={`p-4 rounded-lg border ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            Venda #{sale.id.slice(0, 8)}
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Atrasado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1" suppressHydrationWarning>
                          Data: {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                          {sale.due_date && ` | Vencimento: ${new Date(sale.due_date).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Restante</p>
                        <p className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.total_amount)}
                      </span>
                      <span className="text-green-600">
                        Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.paid_amount)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
