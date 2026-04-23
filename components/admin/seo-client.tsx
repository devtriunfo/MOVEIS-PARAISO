'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SeoSettings } from '@/lib/types'
import { 
  Search,
  Globe,
  Save,
  Plus,
  Trash2,
  X,
  Loader2,
  FileText,
  Tag,
  Image
} from 'lucide-react'

interface SeoClientProps {
  initialSettings: SeoSettings[]
}

export function SeoClient({ initialSettings }: SeoClientProps) {
  const [settings, setSettings] = useState<SeoSettings[]>(initialSettings)
  const [selectedPage, setSelectedPage] = useState<SeoSettings | null>(initialSettings[0] || null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedPage) return
    
    setSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('seo_settings')
      .update({
        title: selectedPage.title,
        description: selectedPage.description,
        keywords: selectedPage.keywords,
        og_image: selectedPage.og_image,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPage.id)
    
    if (!error) {
      setSettings(settings.map(s => s.id === selectedPage.id ? selectedPage : s))
    }
    
    setSaving(false)
  }

  const handleAddPage = async (pageName: string) => {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('seo_settings')
      .insert({ page_name: pageName })
      .select()
      .single()
    
    if (!error && data) {
      setSettings([...settings, data])
      setSelectedPage(data)
    }
    
    setLoading(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta página?')) return
    
    const supabase = createClient()
    const { error } = await supabase.from('seo_settings').delete().eq('id', id)
    
    if (!error) {
      const newSettings = settings.filter(s => s.id !== id)
      setSettings(newSettings)
      setSelectedPage(newSettings[0] || null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações SEO</h1>
          <p className="text-gray-500 mt-1">Otimize seu site para mecanismos de busca</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Página
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Páginas</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {settings.length === 0 ? (
                <p className="p-4 text-gray-500 text-sm text-center">Nenhuma página configurada</p>
              ) : (
                settings.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      selectedPage?.id === page.id ? 'bg-amber-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className={`w-4 h-4 ${selectedPage?.id === page.id ? 'text-amber-600' : 'text-gray-400'}`} />
                      <span className={`text-sm ${selectedPage?.id === page.id ? 'text-amber-600 font-medium' : 'text-gray-700'}`}>
                        {page.page_name}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {selectedPage ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedPage.page_name}</h2>
                    <p className="text-sm text-gray-500" suppressHydrationWarning>
                      Última atualização: {new Date(selectedPage.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(selectedPage.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Título da Página
                  </label>
                  <input
                    type="text"
                    value={selectedPage.title || ''}
                    onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="Título para aparecer nos resultados de busca"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 50-60 caracteres | Atual: {selectedPage.title?.length || 0}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4" />
                    Meta Descrição
                  </label>
                  <textarea
                    value={selectedPage.description || ''}
                    onChange={(e) => setSelectedPage({ ...selectedPage, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-gray-900"
                    rows={3}
                    placeholder="Descrição que aparece nos resultados de busca"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 150-160 caracteres | Atual: {selectedPage.description?.length || 0}
                  </p>
                </div>

                {/* Keywords */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4" />
                    Palavras-chave
                  </label>
                  <input
                    type="text"
                    value={selectedPage.keywords || ''}
                    onChange={(e) => setSelectedPage({ ...selectedPage, keywords: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="móveis, sofá, decoração (separadas por vírgula)"
                  />
                </div>

                {/* OG Image */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4" />
                    Imagem de Compartilhamento (OG Image)
                  </label>
                  <input
                    type="url"
                    value={selectedPage.og_image || ''}
                    onChange={(e) => setSelectedPage({ ...selectedPage, og_image: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Imagem exibida ao compartilhar nas redes sociais | Tamanho ideal: 1200x630px
                  </p>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-3">Prévia no Google</p>
                  <div className="space-y-1">
                    <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                      {selectedPage.title || 'Título da Página'}
                    </p>
                    <p className="text-green-700 text-sm">
                      https://moveisparaiso.com.br/{selectedPage.page_name === 'home' ? '' : selectedPage.page_name}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {selectedPage.description || 'Adicione uma descrição para melhorar o SEO da sua página.'}
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Selecione uma página para editar ou crie uma nova</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Page Modal */}
      {showModal && (
        <AddPageModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddPage}
          loading={loading}
          existingPages={settings.map(s => s.page_name)}
        />
      )}
    </div>
  )
}

function AddPageModal({
  onClose,
  onAdd,
  loading,
  existingPages,
}: {
  onClose: () => void
  onAdd: (pageName: string) => void
  loading: boolean
  existingPages: string[]
}) {
  const [pageName, setPageName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const name = pageName.toLowerCase().trim().replace(/\s+/g, '-')
    
    if (existingPages.includes(name)) {
      setError('Esta página já existe')
      return
    }
    
    onAdd(name)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Nova Página</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Página</label>
            <input
              type="text"
              value={pageName}
              onChange={(e) => {
                setPageName(e.target.value)
                setError('')
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
              placeholder="Ex: produtos, sobre, contato"
              required
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
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
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
