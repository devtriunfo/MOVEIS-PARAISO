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

export interface FiscalCompanySettings {
  id: string
  company_name: string
  cnpj: string
  ie: string | null
  im: string | null
  regime_tributario: string
  address_street: string
  address_number: string
  address_district: string
  address_city: string
  address_city_ibge: string
  address_state: string
  address_zip_code: string
  phone: string | null
  email: string | null
  nfce_series: number
  nfe_series: number
  ambiente: 'homologacao' | 'producao'
  focus_token: string | null
  focus_api_url: string
  webhook_secret: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FiscalDocument {
  id: string
  sale_id: string | null
  customer_id: string | null
  document_type: 'nfe' | 'nfce'
  reference: string
  status: 'pending' | 'processing' | 'authorized' | 'rejected' | 'cancelled'
  focus_id: string | null
  number: number | null
  series: number | null
  access_key: string | null
  protocol: string | null
  xml_url: string | null
  danfe_url: string | null
  error_message: string | null
  request_payload: Record<string, unknown> | null
  focus_response: Record<string, unknown> | null
  issued_at: string | null
  authorized_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}
