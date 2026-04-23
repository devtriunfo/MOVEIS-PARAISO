'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Sale, SaleItem, Product, Customer } from '@/lib/types'
import { 
  Plus, 
  Search, 
  ShoppingCart,
  X,
  Loader2,
  Trash2,
  Eye,
  Package,
  User,
  Minus,
  Edit2
} from 'lucide-react'
import Image from 'next/image'

interface SaleWithCustomer extends Sale {
  customer?: { id: string; name: string; phone: string | null } | null
}

interface CartItem {
  product: Product
  quantity: number
}

export function SalesClient({ 
  initialSales,
  initialSaleItems,
  products,
  customers
}: { 
  initialSales: SaleWithCustomer[]
  initialSaleItems: SaleItem[]
  products: Product[]
  customers: Customer[]
}) {
  const [sales, setSales] = useState(initialSales)
  const [saleItems, setSaleItems] = useState(initialSaleItems)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewSaleModal, setShowNewSaleModal] = useState(false)
  const [showSaleDetails, setShowSaleDetails] = useState<string | null>(null)
  const [editingSale, setEditingSale] = useState<string | null>(null)
  const router = useRouter()

  const filteredSales = sales.filter(sale => 
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'partial': return 'bg-yellow-100 text-yellow-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'partial': return 'Parcial'
      case 'overdue': return 'Atrasado'
      default: return 'Pendente'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getSaleItems = (saleId: string) => {
    return saleItems.filter(item => item.sale_id === saleId)
  }

  const getProductImage = (productId: string | null) => {
    if (!productId) return null
    const product = products.find(p => p.id === productId)
    return product?.image_url || null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-500">Gerencie as vendas e controle o estoque</p>
        </div>
        <button
          onClick={() => setShowNewSaleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Venda
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente ou ID da venda..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produtos</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pago</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhuma venda encontrada</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {sale.customer?.name || 'Cliente não identificado'}
                          </p>
                          <p className="text-sm text-gray-500">{sale.customer?.phone || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getSaleItems(sale.id).slice(0, 2).map(item => {
                          const imageUrl = getProductImage(item.product_id)
                          return (
                            <div key={item.id} className="flex items-center gap-2">
                              {imageUrl ? (
                                <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0">
                                  <Image 
                                    src={imageUrl} 
                                    alt={item.product_name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                                  <Package className="w-4 h-4 text-amber-600" />
                                </div>
                              )}
                              <span className="text-sm text-gray-700">
                                {item.quantity}x {item.product_name}
                              </span>
                            </div>
                          )
                        })}
                        {getSaleItems(sale.id).length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{getSaleItems(sale.id).length - 2} item(s)
                          </span>
                        )}
                        {getSaleItems(sale.id).length === 0 && (
                          <span className="text-sm text-gray-400">Sem itens</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600" suppressHydrationWarning>
                      {formatDate(sale.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatCurrency(sale.paid_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                        {getStatusLabel(sale.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setShowSaleDetails(sale.id)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingSale(sale.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar venda"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <NewSaleModal
          products={products}
          customers={customers}
          onClose={() => setShowNewSaleModal(false)}
          onSuccess={(newSale) => {
            setSales([newSale, ...sales])
            setShowNewSaleModal(false)
            router.refresh()
          }}
        />
      )}

      {/* Sale Details Modal */}
      {showSaleDetails && (
        <SaleDetailsModal
          sale={sales.find(s => s.id === showSaleDetails)!}
          items={getSaleItems(showSaleDetails)}
          products={products}
          onClose={() => setShowSaleDetails(null)}
        />
      )}

      {/* Edit Sale Modal */}
      {editingSale && (
        <EditSaleModal
          sale={sales.find(s => s.id === editingSale)!}
          items={getSaleItems(editingSale)}
          products={products}
          customers={customers}
          onClose={() => setEditingSale(null)}
          onSuccess={(updatedSale, updatedItems) => {
            setSales(sales.map(s => s.id === updatedSale.id ? updatedSale : s))
            setSaleItems(prev => [
              ...prev.filter(i => i.sale_id !== updatedSale.id),
              ...updatedItems
            ])
            setEditingSale(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

// Modal para nova venda
function NewSaleModal({
  products,
  customers,
  onClose,
  onSuccess
}: {
  products: Product[]
  customers: Customer[]
  onClose: () => void
  onSuccess: (sale: SaleWithCustomer) => void
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('dinheiro')
  const [paidAmount, setPaidAmount] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchProduct, setSearchProduct] = useState('')

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
    p.stock_quantity > 0
  )

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id)
    if (existing) {
      if (existing.quantity < product.stock_quantity) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      }
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find(i => i.product.id === productId)
    if (!item) return
    
    if (quantity <= 0) {
      removeFromCart(productId)
    } else if (quantity <= item.product.stock_quantity) {
      setCart(cart.map(i => 
        i.product.id === productId ? { ...i, quantity } : i
      ))
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Adicione pelo menos um produto ao carrinho')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const paid = parseFloat(paidAmount) || 0
      
      // Determinar status
      let status: string = 'pending'
      if (paid >= total) {
        status = 'paid'
      } else if (paid > 0) {
        status = 'partial'
      }

      // 1. Criar a venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: selectedCustomer || null,
          total_amount: total,
          paid_amount: paid,
          status,
          payment_method: paymentMethod,
          due_date: dueDate || null,
          notes: notes || null,
        })
        .select(`*, customer:customers(id, name, phone)`)
        .single()

      if (saleError) throw saleError

      // 2. Criar os itens da venda
      const saleItemsData = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData)

      if (itemsError) throw itemsError

      // 3. Atualizar o estoque de cada produto (REGRA DE NEGÓCIO PRINCIPAL)
      for (const item of cart) {
        const newStock = item.product.stock_quantity - item.quantity
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ 
            stock_quantity: newStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product.id)

        if (stockError) throw stockError
      }

      // 4. Se houve pagamento, registrar
      if (paid > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            sale_id: sale.id,
            customer_id: selectedCustomer || null,
            amount: paid,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: paymentMethod,
          })

        if (paymentError) throw paymentError
      }

      onSuccess(sale)
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar venda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nova Venda</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Produtos */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Produtos Disponíveis</h3>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <div className="w-10 h-10 relative rounded-lg overflow-hidden flex-shrink-0">
                          <Image 
                            src={product.image_url} 
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-amber-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">Estoque: {product.stock_quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-amber-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </p>
                      <button className="text-xs text-amber-600 hover:underline">+ Adicionar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrinho */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Carrinho</h3>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {item.product.image_url ? (
                          <div className="w-10 h-10 relative rounded-lg overflow-hidden flex-shrink-0">
                            <Image 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.price)} un.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 bg-white rounded hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 bg-white rounded hover:bg-gray-100"
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecione um cliente (opcional)</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="boleto">Boleto</option>
                <option value="crediario">Crediário</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={total}
                placeholder="0,00"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Observações sobre a venda..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Finalizar Venda
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal de detalhes da venda
function SaleDetailsModal({
  sale,
  items,
  products,
  onClose
}: {
  sale: SaleWithCustomer
  items: SaleItem[]
  products: Product[]
  onClose: () => void
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getProductImage = (productId: string | null) => {
    if (!productId) return null
    const product = products.find(p => p.id === productId)
    return product?.image_url || null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes da Venda</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{sale.customer?.name || 'Não identificado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-medium text-lg">{formatCurrency(sale.total_amount)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Pago</p>
              <p className="font-medium text-lg text-green-600">{formatCurrency(sale.paid_amount)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Itens da Venda</h3>
            <div className="space-y-2">
              {items.map(item => {
                const imageUrl = getProductImage(item.product_id)
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {imageUrl ? (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                          <Image 
                            src={imageUrl} 
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-amber-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity}x {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(item.total_price)}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {sale.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Observações</p>
              <p className="text-gray-700">{sale.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal para editar venda
function EditSaleModal({
  sale,
  items,
  products,
  customers,
  onClose,
  onSuccess
}: {
  sale: SaleWithCustomer
  items: SaleItem[]
  products: Product[]
  customers: Customer[]
  onClose: () => void
  onSuccess: (sale: SaleWithCustomer, items: SaleItem[]) => void
}) {
  const [cart, setCart] = useState<CartItem[]>(
    items.map(item => {
      const product = products.find(p => p.id === item.product_id)
      return {
        product: product || {
          id: item.product_id || '',
          name: item.product_name,
          description: null,
          category: '',
          price: item.unit_price,
          cost_price: null,
          stock_quantity: 999,
          min_stock: 0,
          image_url: null,
          created_at: '',
          updated_at: ''
        },
        quantity: item.quantity,
        originalQuantity: item.quantity
      } as CartItem & { originalQuantity: number }
    })
  )
  const [selectedCustomer, setSelectedCustomer] = useState<string>(sale.customer_id || '')
  const [paymentMethod, setPaymentMethod] = useState<string>(sale.payment_method || 'dinheiro')
  const [paidAmount, setPaidAmount] = useState<string>(sale.paid_amount?.toString() || '0')
  const [dueDate, setDueDate] = useState<string>(sale.due_date || '')
  const [notes, setNotes] = useState<string>(sale.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchProduct, setSearchProduct] = useState('')

  // Calcular estoque disponível considerando o que já estava na venda
  const getAvailableStock = (product: Product) => {
    const originalItem = items.find(i => i.product_id === product.id)
    const originalQty = originalItem?.quantity || 0
    return product.stock_quantity + originalQty
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id)
    const availableStock = getAvailableStock(product)
    
    if (existing) {
      if (existing.quantity < availableStock) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      }
    } else {
      if (availableStock > 0) {
        setCart([...cart, { product, quantity: 1 }])
      }
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cart.find(i => i.product.id === productId)
    if (!item) return
    
    const availableStock = getAvailableStock(item.product)
    
    if (quantity <= 0) {
      removeFromCart(productId)
    } else if (quantity <= availableStock) {
      setCart(cart.map(i => 
        i.product.id === productId ? { ...i, quantity } : i
      ))
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('Adicione pelo menos um produto ao carrinho')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const paid = parseFloat(paidAmount) || 0
      
      // Determinar status
      let status: string = 'pending'
      if (paid >= total) {
        status = 'paid'
      } else if (paid > 0) {
        status = 'partial'
      }

      // 1. Restaurar estoque dos itens originais
      for (const item of items) {
        if (item.product_id) {
          const product = products.find(p => p.id === item.product_id)
          if (product) {
            const newStock = product.stock_quantity + item.quantity
            await supabase
              .from('products')
              .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
              .eq('id', item.product_id)
          }
        }
      }

      // 2. Atualizar a venda
      const { data: updatedSale, error: saleError } = await supabase
        .from('sales')
        .update({
          customer_id: selectedCustomer || null,
          total_amount: total,
          paid_amount: paid,
          status,
          payment_method: paymentMethod,
          due_date: dueDate || null,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sale.id)
        .select(`*, customer:customers(id, name, phone)`)
        .single()

      if (saleError) throw saleError

      // 3. Deletar itens antigos
      await supabase.from('sale_items').delete().eq('sale_id', sale.id)

      // 4. Criar novos itens da venda
      const saleItemsData = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }))

      const { data: newItems, error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsData)
        .select()

      if (itemsError) throw itemsError

      // 5. Decrementar estoque dos novos itens
      for (const item of cart) {
        const product = products.find(p => p.id === item.product.id)
        if (product) {
          const originalItem = items.find(i => i.product_id === item.product.id)
          const originalQty = originalItem?.quantity || 0
          const newStock = product.stock_quantity + originalQty - item.quantity
          
          await supabase
            .from('products')
            .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
            .eq('id', item.product.id)
        }
      }

      onSuccess(updatedSale, newItems || [])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar venda'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Venda</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Produtos */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Produtos Disponíveis</h3>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredProducts.map(product => {
                  const availableStock = getAvailableStock(product)
                  return (
                    <div 
                      key={product.id}
                      className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${availableStock > 0 ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-50'}`}
                      onClick={() => availableStock > 0 && addToCart(product)}
                    >
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <div className="w-10 h-10 relative rounded-lg overflow-hidden flex-shrink-0">
                            <Image 
                              src={product.image_url} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">Disponível: {availableStock}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-amber-600">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                        </p>
                        {availableStock > 0 && (
                          <button className="text-xs text-amber-600 hover:underline">+ Adicionar</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Carrinho */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Itens da Venda</h3>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum item</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cart.map(item => {
                    const availableStock = getAvailableStock(item.product)
                    return (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.product.image_url ? (
                            <div className="w-10 h-10 relative rounded-lg overflow-hidden flex-shrink-0">
                              <Image 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-amber-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.price)} un.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 bg-white rounded hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 bg-white rounded hover:bg-gray-100"
                            disabled={item.quantity >= availableStock}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Total */}
              <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total:</span>
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecione um cliente (opcional)</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="boleto">Boleto</option>
                <option value="crediario">Crediário</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Observações sobre a venda..."
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Edit2 className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
