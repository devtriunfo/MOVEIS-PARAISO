import { createClient } from '@/lib/supabase/server'
import { CustomersClient } from '@/components/admin/customers-client'

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  
  const { data: sales } = await supabase
    .from('sales')
    .select('*')
  
  // Calcular débitos por cliente
  const customersWithDebt = customers?.map(customer => {
    const customerSales = sales?.filter(s => s.customer_id === customer.id) || []
    const totalDebt = customerSales.reduce((acc, s) => acc + (s.total_amount - s.paid_amount), 0)
    const overdueSales = customerSales.filter(s => {
      if (!s.due_date) return false
      return new Date(s.due_date) < new Date() && s.status !== 'paid'
    }).length

    return {
      ...customer,
      total_debt: totalDebt,
      overdue_sales: overdueSales,
    }
  }) || []

  // Filtrar se necessário
  const filteredCustomers = params.filter === 'debtors'
    ? customersWithDebt.filter(c => c.total_debt > 0)
    : customersWithDebt

  return (
    <CustomersClient 
      initialCustomers={filteredCustomers}
      filter={params.filter}
    />
  )
}
