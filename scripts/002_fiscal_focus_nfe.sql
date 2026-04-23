-- Estrutura fiscal para integração com Focus NFe (NF-e e NFC-e)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS fiscal_company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  ie TEXT,
  im TEXT,
  regime_tributario TEXT NOT NULL DEFAULT 'simples_nacional',
  address_street TEXT NOT NULL,
  address_number TEXT NOT NULL,
  address_district TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_city_ibge TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zip_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  nfce_series INTEGER NOT NULL DEFAULT 1,
  nfe_series INTEGER NOT NULL DEFAULT 1,
  ambiente TEXT NOT NULL DEFAULT 'homologacao', -- homologacao | producao
  focus_token TEXT,
  focus_api_url TEXT NOT NULL DEFAULT 'https://api.focusnfe.com.br/v2',
  webhook_secret TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fiscal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL, -- nfe | nfce
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | processing | authorized | rejected | cancelled
  focus_id TEXT,
  number INTEGER,
  series INTEGER,
  access_key TEXT,
  protocol TEXT,
  xml_url TEXT,
  danfe_url TEXT,
  error_message TEXT,
  request_payload JSONB,
  focus_response JSONB,
  issued_at TIMESTAMP WITH TIME ZONE,
  authorized_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fiscal_document_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_document_id UUID NOT NULL REFERENCES fiscal_documents(id) ON DELETE CASCADE,
  sale_item_id UUID REFERENCES sale_items(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  ncm TEXT,
  cfop TEXT,
  cst_csosn TEXT,
  quantity DECIMAL(10,3) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fiscal_document_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_document_id UUID NOT NULL REFERENCES fiscal_documents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- created | status_check | webhook | cancel
  event_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fiscal_documents_sale_id ON fiscal_documents(sale_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_reference ON fiscal_documents(reference);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_status ON fiscal_documents(status);

ALTER TABLE fiscal_company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_document_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_document_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fiscal_company_settings" ON fiscal_company_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fiscal_company_settings" ON fiscal_company_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fiscal_company_settings" ON fiscal_company_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete fiscal_company_settings" ON fiscal_company_settings FOR DELETE USING (true);

CREATE POLICY "Anyone can view fiscal_documents" ON fiscal_documents FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fiscal_documents" ON fiscal_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fiscal_documents" ON fiscal_documents FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete fiscal_documents" ON fiscal_documents FOR DELETE USING (true);

CREATE POLICY "Anyone can view fiscal_document_items" ON fiscal_document_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fiscal_document_items" ON fiscal_document_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fiscal_document_items" ON fiscal_document_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete fiscal_document_items" ON fiscal_document_items FOR DELETE USING (true);

CREATE POLICY "Anyone can view fiscal_document_events" ON fiscal_document_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fiscal_document_events" ON fiscal_document_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fiscal_document_events" ON fiscal_document_events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete fiscal_document_events" ON fiscal_document_events FOR DELETE USING (true);
