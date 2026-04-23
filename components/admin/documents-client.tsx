'use client'

import { useState, useRef } from 'react'
import type { Customer, Product, Sale, SaleItem } from '@/lib/types'
import { 
  FileText, 
  Plus, 
  Printer,
  X,
  Search,
  Package,
  User,
  Minus,
  Trash2,
  Receipt,
  FileCheck,
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react'
import Image from 'next/image'

interface DocumentItem {
  product: Product
  quantity: number
  unit_price: number
}

interface DocumentData {
  type: 'cupom' | 'danfe'
  customer: Customer | null
  items: DocumentItem[]
  paymentMethod: string
  notes: string
  linkedSaleId: string | null
}

type SaleWithCustomer = Sale & {
  customer?: Customer | null
}

export function DocumentsClient({
  customers,
  products,
  sales,
  saleItems
}: {
  customers: Customer[]
  products: Product[]
  sales: SaleWithCustomer[]
  saleItems: SaleItem[]
}) {
  const [showNewDocument, setShowNewDocument] = useState(false)
  const [documentType, setDocumentType] = useState<'cupom' | 'danfe'>('cupom')
  const [generatedDocument, setGeneratedDocument] = useState<DocumentData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  const filteredSales = sales.filter(sale => 
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getSaleItems = (saleId: string) => {
    return saleItems.filter(item => item.sale_id === saleId)
  }

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${generatedDocument?.type === 'cupom' ? 'Cupom Fiscal' : 'DANFE'}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Courier New', monospace; padding: 20px; }
              .cupom { max-width: 300px; margin: 0 auto; }
              .danfe { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
              .company-name { font-size: 16px; font-weight: bold; }
              .company-info { font-size: 10px; }
              .section { margin: 10px 0; padding: 10px 0; border-bottom: 1px dashed #000; }
              .section-title { font-weight: bold; margin-bottom: 5px; }
              .item { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
              .total { font-size: 14px; font-weight: bold; text-align: right; margin-top: 10px; }
              .footer { text-align: center; font-size: 10px; margin-top: 20px; }
              .danfe-header { display: flex; border: 2px solid #000; margin-bottom: 10px; }
              .danfe-logo { width: 150px; padding: 10px; border-right: 2px solid #000; }
              .danfe-title { flex: 1; padding: 10px; text-align: center; border-right: 2px solid #000; }
              .danfe-title h1 { font-size: 24px; }
              .danfe-info { width: 200px; padding: 10px; font-size: 12px; }
              .danfe-section { border: 1px solid #000; margin-bottom: 5px; padding: 8px; }
              .danfe-row { display: flex; gap: 10px; }
              .danfe-field { flex: 1; }
              .danfe-label { font-size: 9px; color: #666; }
              .danfe-value { font-size: 11px; font-weight: bold; }
              .danfe-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .danfe-table th, .danfe-table td { border: 1px solid #000; padding: 5px; font-size: 10px; text-align: left; }
              .danfe-table th { background: #f0f0f0; }
              @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>${printContent}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const generateDocumentNumber = () => {
    return Math.floor(Math.random() * 900000000) + 100000000
  }

  const generateAccessKey = () => {
    let key = ''
    for (let i = 0; i < 44; i++) {
      key += Math.floor(Math.random() * 10)
    }
    return key
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos Fiscais</h1>
          <p className="text-gray-500 mt-1">Gere cupons fiscais e notas DANFE</p>
        </div>
        <button
          onClick={() => setShowNewDocument(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Documento
        </button>
      </div>

      {/* Tipo de Documento */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Documento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => { setDocumentType('cupom'); setShowNewDocument(true); }}
            className="flex items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-colors"
          >
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
              <Receipt className="w-7 h-7 text-amber-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Cupom Fiscal (NFC-e)</h3>
              <p className="text-sm text-gray-500">Documento simplificado para vendas ao consumidor</p>
            </div>
          </button>
          
          <button
            onClick={() => { setDocumentType('danfe'); setShowNewDocument(true); }}
            className="flex items-center gap-4 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileCheck className="w-7 h-7 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">DANFE (NF-e)</h3>
              <p className="text-sm text-gray-500">Documento auxiliar da nota fiscal eletrônica</p>
            </div>
          </button>
        </div>
      </div>

      {/* Vendas Recentes (opcional para vincular) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vendas Recentes</h2>
          <p className="text-sm text-gray-500 mt-1">Opcionalmente, gere documento a partir de uma venda existente</p>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou ID da venda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {filteredSales.slice(0, 10).map(sale => (
            <div key={sale.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{sale.customer?.name || 'Cliente não identificado'}</p>
                  <p className="text-sm text-gray-500" suppressHydrationWarning>
                    {new Date(sale.created_at).toLocaleDateString('pt-BR')} - {formatCurrency(sale.total_amount)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDocumentType('cupom')
                    const items = getSaleItems(sale.id).map(item => {
                      const product = products.find(p => p.id === item.product_id)
                      return {
                        product: product || { id: '', name: item.product_name, price: item.unit_price } as Product,
                        quantity: item.quantity,
                        unit_price: item.unit_price
                      }
                    })
                    setGeneratedDocument({
                      type: 'cupom',
                      customer: sale.customer || null,
                      items,
                      paymentMethod: sale.payment_method || 'Dinheiro',
                      notes: sale.notes || '',
                      linkedSaleId: sale.id
                    })
                  }}
                  className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                >
                  Cupom
                </button>
                <button
                  onClick={() => {
                    setDocumentType('danfe')
                    const items = getSaleItems(sale.id).map(item => {
                      const product = products.find(p => p.id === item.product_id)
                      return {
                        product: product || { id: '', name: item.product_name, price: item.unit_price } as Product,
                        quantity: item.quantity,
                        unit_price: item.unit_price
                      }
                    })
                    setGeneratedDocument({
                      type: 'danfe',
                      customer: sale.customer || null,
                      items,
                      paymentMethod: sale.payment_method || 'Dinheiro',
                      notes: sale.notes || '',
                      linkedSaleId: sale.id
                    })
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  DANFE
                </button>
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Nenhuma venda encontrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Documento */}
      {showNewDocument && (
        <NewDocumentModal
          type={documentType}
          customers={customers}
          products={products}
          onClose={() => setShowNewDocument(false)}
          onGenerate={(data) => {
            setGeneratedDocument(data)
            setShowNewDocument(false)
          }}
        />
      )}

      {/* Documento Gerado */}
      {generatedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {generatedDocument.type === 'cupom' ? 'Cupom Fiscal' : 'DANFE'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={() => setGeneratedDocument(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div ref={printRef} className="bg-white p-6 rounded-lg shadow mx-auto" style={{ maxWidth: generatedDocument.type === 'cupom' ? '320px' : '800px' }}>
                {generatedDocument.type === 'cupom' ? (
                  <CupomFiscal data={generatedDocument} documentNumber={generateDocumentNumber()} />
                ) : (
                  <DanfeDocument data={generatedDocument} documentNumber={generateDocumentNumber()} accessKey={generateAccessKey()} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Modal para criar novo documento
function NewDocumentModal({
  type,
  customers,
  products,
  onClose,
  onGenerate
}: {
  type: 'cupom' | 'danfe'
  customers: Customer[]
  products: Product[]
  onClose: () => void
  onGenerate: (data: DocumentData) => void
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [cart, setCart] = useState<DocumentItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro')
  const [notes, setNotes] = useState('')
  const [searchProduct, setSearchProduct] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id)
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1, unit_price: product.price }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      setCart(cart.map(item => 
        item.product.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)

  const handleGenerate = () => {
    if (cart.length === 0) return
    onGenerate({
      type,
      customer: selectedCustomer,
      items: cart,
      paymentMethod,
      notes,
      linkedSaleId: null
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {type === 'cupom' ? (
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-amber-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {type === 'cupom' ? 'Novo Cupom Fiscal' : 'Nova DANFE'}
              </h2>
              <p className="text-sm text-gray-500">Preencha os dados do documento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cliente */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente {type === 'danfe' && <span className="text-red-500">*</span>}
              </h3>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {selectedCustomer ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-500">{selectedCustomer.cpf || 'CPF não informado'}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className="p-1 hover:bg-green-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredCustomers.slice(0, 5).map(customer => (
                    <div 
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <p className="font-medium text-gray-900 text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.cpf || 'CPF não informado'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagamento */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Forma de Pagamento
              </h3>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Boleto">Boleto</option>
                <option value="Crediário">Crediário</option>
              </select>

              <h3 className="font-medium text-gray-900 mb-3 mt-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Observações
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Observações opcionais..."
              />
            </div>
          </div>

          {/* Produtos */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lista de produtos */}
              <div>
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
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredProducts.slice(0, 10).map(product => (
                    <div 
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <div className="w-10 h-10 relative rounded overflow-hidden">
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-amber-100 rounded flex items-center justify-center">
                            <Package className="w-5 h-5 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                          </p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-amber-600" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrinho */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Itens selecionados</p>
                {cart.length === 0 ? (
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum item adicionado</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)} un.
                          </p>
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
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateQuantity(item.product.id, 0)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
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
          </div>
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
            onClick={handleGenerate}
            disabled={cart.length === 0 || (type === 'danfe' && !selectedCustomer)}
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-5 h-5" />
            Gerar {type === 'cupom' ? 'Cupom' : 'DANFE'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente Cupom Fiscal
function CupomFiscal({ data, documentNumber }: { data: DocumentData, documentNumber: number }) {
  const total = data.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const now = new Date()

  return (
    <div className="cupom font-mono text-xs">
      <div className="header">
        <div className="company-name">MÓVEIS PARAÍSO LTDA</div>
        <div className="company-info">CNPJ: 12.345.678/0001-90</div>
        <div className="company-info">Rua das Flores, 123 - Centro</div>
        <div className="company-info">São Paulo - SP - CEP: 01234-567</div>
        <div className="company-info mt-2">
          <strong>CUPOM FISCAL ELETRÔNICO - NFC-e</strong>
        </div>
      </div>

      <div className="section">
        <div className="section-title">CONSUMIDOR</div>
        {data.customer ? (
          <>
            <div>Nome: {data.customer.name}</div>
            <div>CPF: {data.customer.cpf || 'Não informado'}</div>
          </>
        ) : (
          <div>CONSUMIDOR NÃO IDENTIFICADO</div>
        )}
      </div>

      <div className="section">
        <div className="section-title">ITENS</div>
        {data.items.map((item, index) => (
          <div key={index} className="my-2">
            <div>{String(index + 1).padStart(3, '0')} {item.product.name}</div>
            <div className="item">
              <span>{item.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}</span>
              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price * item.quantity)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="item">
          <span>Subtotal:</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
        </div>
        <div className="item">
          <span>Desconto:</span>
          <span>R$ 0,00</span>
        </div>
        <div className="total">
          TOTAL: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
        </div>
      </div>

      <div className="section">
        <div className="section-title">FORMA DE PAGAMENTO</div>
        <div className="item">
          <span>{data.paymentMethod}</span>
          <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
        </div>
      </div>

      <div className="footer">
        <div>NFC-e nº {documentNumber}</div>
        <div suppressHydrationWarning>Emissão: {now.toLocaleDateString('pt-BR')} {now.toLocaleTimeString('pt-BR')}</div>
        <div className="mt-2">Consulte pela chave de acesso em:</div>
        <div>www.nfce.fazenda.sp.gov.br</div>
        <div className="mt-2 text-[8px] break-all">
          Chave: {Math.random().toString().slice(2, 46).padEnd(44, '0')}
        </div>
      </div>
    </div>
  )
}

// Componente DANFE
function DanfeDocument({ data, documentNumber, accessKey }: { data: DocumentData, documentNumber: number, accessKey: string }) {
  const total = data.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const now = new Date()

  return (
    <div className="danfe text-xs">
      {/* Header */}
      <div className="danfe-header">
        <div className="danfe-logo flex items-center justify-center">
          <div className="text-center">
            <Building2 className="w-12 h-12 mx-auto text-gray-700" />
            <div className="font-bold mt-2">MÓVEIS PARAÍSO</div>
          </div>
        </div>
        <div className="danfe-title">
          <h1 className="text-2xl font-bold">DANFE</h1>
          <p className="text-[10px]">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</p>
          <p className="mt-2">0 - ENTRADA</p>
          <p className="font-bold">1 - SAÍDA</p>
          <p className="mt-2 font-bold text-lg">Nº {String(documentNumber).slice(0, 9)}</p>
          <p>SÉRIE 001</p>
        </div>
        <div className="danfe-info">
          <div className="text-center mb-2">
            <strong>CHAVE DE ACESSO</strong>
          </div>
          <div className="text-[8px] break-all font-mono bg-gray-100 p-1">
            {accessKey}
          </div>
          <div className="mt-2 text-center">
            <div className="w-full h-12 bg-gray-200 flex items-center justify-center">
              <span className="text-[8px]">CÓDIGO DE BARRAS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emitente */}
      <div className="danfe-section">
        <div className="danfe-row">
          <div className="danfe-field" style={{ flex: 3 }}>
            <div className="danfe-label">RAZÃO SOCIAL</div>
            <div className="danfe-value">MÓVEIS PARAÍSO COMÉRCIO LTDA</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">CNPJ</div>
            <div className="danfe-value">12.345.678/0001-90</div>
          </div>
        </div>
        <div className="danfe-row mt-1">
          <div className="danfe-field" style={{ flex: 2 }}>
            <div className="danfe-label">ENDEREÇO</div>
            <div className="danfe-value">Rua das Flores, 123 - Centro</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">BAIRRO</div>
            <div className="danfe-value">Centro</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">CEP</div>
            <div className="danfe-value">01234-567</div>
          </div>
        </div>
        <div className="danfe-row mt-1">
          <div className="danfe-field">
            <div className="danfe-label">MUNICÍPIO</div>
            <div className="danfe-value">São Paulo</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">UF</div>
            <div className="danfe-value">SP</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">TELEFONE</div>
            <div className="danfe-value">(11) 1234-5678</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">IE</div>
            <div className="danfe-value">123.456.789.012</div>
          </div>
        </div>
      </div>

      {/* Destinatário */}
      <div className="danfe-section">
        <div className="text-[9px] font-bold mb-1">DESTINATÁRIO/REMETENTE</div>
        <div className="danfe-row">
          <div className="danfe-field" style={{ flex: 3 }}>
            <div className="danfe-label">NOME/RAZÃO SOCIAL</div>
            <div className="danfe-value">{data.customer?.name || 'CONSUMIDOR FINAL'}</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">CPF/CNPJ</div>
            <div className="danfe-value">{data.customer?.cpf || 'Não informado'}</div>
          </div>
          <div className="danfe-field" suppressHydrationWarning>
            <div className="danfe-label">DATA EMISSÃO</div>
            <div className="danfe-value">{now.toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
        <div className="danfe-row mt-1">
          <div className="danfe-field" style={{ flex: 2 }}>
            <div className="danfe-label">ENDEREÇO</div>
            <div className="danfe-value">{data.customer?.address || '-'}</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">BAIRRO</div>
            <div className="danfe-value">-</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">CEP</div>
            <div className="danfe-value">-</div>
          </div>
        </div>
        <div className="danfe-row mt-1">
          <div className="danfe-field">
            <div className="danfe-label">MUNICÍPIO</div>
            <div className="danfe-value">{data.customer?.city || '-'}</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">UF</div>
            <div className="danfe-value">{data.customer?.state || '-'}</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">TELEFONE</div>
            <div className="danfe-value">{data.customer?.phone || '-'}</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">IE</div>
            <div className="danfe-value">ISENTO</div>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="danfe-section">
        <div className="text-[9px] font-bold mb-1">DADOS DOS PRODUTOS/SERVIÇOS</div>
        <table className="danfe-table">
          <thead>
            <tr>
              <th>CÓD.</th>
              <th>DESCRIÇÃO</th>
              <th>NCM</th>
              <th>UN</th>
              <th>QTD</th>
              <th>V. UNIT</th>
              <th>V. TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index}>
                <td>{String(index + 1).padStart(4, '0')}</td>
                <td>{item.product.name}</td>
                <td>94036000</td>
                <td>UN</td>
                <td>{item.quantity}</td>
                <td>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(item.unit_price)}</td>
                <td>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(item.unit_price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="danfe-section">
        <div className="text-[9px] font-bold mb-1">CÁLCULO DO IMPOSTO</div>
        <div className="danfe-row">
          <div className="danfe-field">
            <div className="danfe-label">BASE DE CÁLCULO ICMS</div>
            <div className="danfe-value">{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(total)}</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">VALOR ICMS</div>
            <div className="danfe-value">{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(total * 0.18)}</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">VALOR FRETE</div>
            <div className="danfe-value">0,00</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">VALOR SEGURO</div>
            <div className="danfe-value">0,00</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">DESCONTO</div>
            <div className="danfe-value">0,00</div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">VALOR TOTAL</div>
            <div className="danfe-value font-bold">{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(total)}</div>
          </div>
        </div>
      </div>

      {/* Dados Adicionais */}
      <div className="danfe-section">
        <div className="text-[9px] font-bold mb-1">DADOS ADICIONAIS</div>
        <div className="danfe-row">
          <div className="danfe-field" style={{ flex: 2 }}>
            <div className="danfe-label">INFORMAÇÕES COMPLEMENTARES</div>
            <div className="danfe-value text-[8px]">
              {data.notes || 'Sem observações adicionais.'} | Forma de pagamento: {data.paymentMethod}
            </div>
          </div>
          <div className="danfe-field">
            <div className="danfe-label">RESERVADO AO FISCO</div>
            <div className="danfe-value text-[8px]">-</div>
          </div>
        </div>
      </div>
    </div>
  )
}
