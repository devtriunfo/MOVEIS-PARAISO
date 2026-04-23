import { createClient } from '@/lib/supabase/server'
import { ProductsClient } from '@/components/admin/products-client'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })
  
  const { data: products, error } = await query

  const filteredProducts = products?.filter(p => {
    if (params.filter === 'low_stock') {
      return p.stock_quantity <= p.min_stock
    }
    if (params.search) {
      return p.name.toLowerCase().includes(params.search.toLowerCase()) ||
             p.category.toLowerCase().includes(params.search.toLowerCase())
    }
    return true
  }) || []

  const categories = [...new Set(products?.map(p => p.category) || [])]

  return (
    <ProductsClient 
      initialProducts={filteredProducts} 
      categories={categories}
      filter={params.filter}
    />
  )
}
