import { createClient } from '@/lib/supabase/server'
import { SalesClient } from '@/components/admin/sales-client'

export default async function SalesPage() {
  const supabase = await createClient()

  // Buscar vendas com informações do cliente
  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      customer:customers(id, name, phone)
    `)
    .order('created_at', { ascending: false })

  // Buscar itens de cada venda
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('*')

  // Buscar produtos para o formulário de nova venda
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .gt('stock_quantity', 0)
    .order('name')

  // Buscar clientes para o formulário
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('name')

  return (
    <SalesClient 
      initialSales={sales || []} 
      initialSaleItems={saleItems || []}
      products={products || []}
      customers={customers || []}
    />
  )
}
