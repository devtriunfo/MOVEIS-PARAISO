export interface Product {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  cost_price: number | null
  stock_quantity: number
  min_stock: number
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpf: string | null
  address: string | null
  city: string | null
  state: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  customer_id: string | null
  total_amount: number
  paid_amount: number
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  payment_method: string | null
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Payment {
  id: string
  sale_id: string
  customer_id: string | null
  amount: number
  payment_date: string
  payment_method: string | null
  notes: string | null
  created_at: string
}

export interface SeoSettings {
  id: string
  page_name: string
  title: string | null
  description: string | null
  keywords: string | null
  og_image: string | null
  updated_at: string
}

export interface CustomerWithDebt extends Customer {
  total_debt: number
  overdue_sales: number
}
