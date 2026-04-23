'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'
import { 
  Plus, 
  Search, 
  Package, 
  Edit2, 
  Trash2, 
  X,
  AlertTriangle,
  Loader2,
  Upload,
  ImageIcon
} from 'lucide-react'
import Image from 'next/image'

interface ProductsClientProps {
  initialProducts: Product[]
  categories: string[]
  filter?: string
}

export function ProductsClient({ initialProducts, categories, filter }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    
    if (!error) {
      setProducts(products.filter(p => p.id !== id))
    }
    setDeleting(null)
  }

  const handleSave = async (data: Partial<Product>) => {
    setLoading(true)
    const supabase = createClient()
    
    if (editingProduct) {
      const { data: updated, error } = await supabase
        .from('products')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', editingProduct.id)
        .select()
        .single()
      
      if (!error && updated) {
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p))
      }
    } else {
      const { data: created, error } = await supabase
        .from('products')
        .insert(data)
        .select()
        .single()
      
      if (!error && created) {
        setProducts([created, ...products])
      }
    }
    
    setLoading(false)
    setShowModal(false)
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500 mt-1">
            {filter === 'low_stock' ? 'Produtos com estoque baixo' : 'Gerencie o estoque de móveis'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null)
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    Nenhum produto encontrado
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                            <Image 
                              src={product.image_url} 
                              alt={product.name}
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
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock_quantity <= product.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock_quantity} un.
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.stock_quantity <= product.min_stock ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          Baixo
                        </span>
                      ) : (
                        <span className="text-green-600">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product)
                            setShowModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowModal(false)
            setEditingProduct(null)
          }}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </div>
  )
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave,
  loading,
}: {
  product: Product | null
  categories: string[]
  onClose: () => void
  onSave: (data: Partial<Product>) => void
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price?.toString() || '',
    cost_price: product?.cost_price?.toString() || '',
    stock_quantity: product?.stock_quantity?.toString() || '0',
    min_stock: product?.min_stock?.toString() || '5',
    image_url: product?.image_url || '',
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || 'Erro no upload')
        return
      }

      setFormData({ ...formData, image_url: data.url })
    } catch {
      setUploadError('Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name: formData.name,
      description: formData.description || null,
      category: formData.category,
      price: parseFloat(formData.price),
      cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
      stock_quantity: parseInt(formData.stock_quantity),
      min_stock: parseInt(formData.min_stock),
      image_url: formData.image_url || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
            <div className="flex items-start gap-4">
              {formData.image_url ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <Image 
                    src={formData.image_url} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-fit">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Escolher Imagem
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP ou GIF. Máximo 5MB.</p>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-gray-900"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              list="categories"
              required
            />
            <datalist id="categories">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Custo</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade em Estoque</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
              <input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                required
              />
            </div>
          </div>

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
              {product ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
