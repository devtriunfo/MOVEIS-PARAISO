import { createClient } from '@/lib/supabase/server'
import { DocumentsClient } from '@/components/admin/documents-client'

export default async function DocumentsPage() {
  const supabase = await createClient()

  // Buscar clientes para seleção
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  // Buscar produtos para seleção
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name')

  // Buscar vendas recentes para vincular opcionalmente
  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(id, name, cpf, phone, address, city, state)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Buscar itens das vendas
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('*')

  return (
    <DocumentsClient 
      customers={customers || []}
      products={products || []}
      sales={sales || []}
      saleItems={saleItems || []}
    />
  )
}
