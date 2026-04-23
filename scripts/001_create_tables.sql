-- Necessário para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela de produtos/móveis
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, partial, cancelled
  payment_method TEXT, -- cash, credit, debit, pix, installments
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pagamentos/parcelas
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações SEO
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtos (acesso público para leitura e escrita)
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE USING (true);

-- Políticas RLS para clientes (acesso público para leitura e escrita)
CREATE POLICY "Authenticated users can view customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete customers" ON customers FOR DELETE USING (true);

-- Políticas RLS para vendas (acesso público para leitura e escrita)
CREATE POLICY "Authenticated users can view sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update sales" ON sales FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete sales" ON sales FOR DELETE USING (true);

-- Políticas RLS para itens de venda (acesso público para leitura e escrita)
CREATE POLICY "Authenticated users can view sale_items" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sale_items" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update sale_items" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete sale_items" ON sale_items FOR DELETE USING (true);

-- Políticas RLS para pagamentos (acesso público para leitura e escrita)
CREATE POLICY "Authenticated users can view payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update payments" ON payments FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete payments" ON payments FOR DELETE USING (true);

-- Políticas RLS para SEO settings (acesso público para leitura e escrita)
CREATE POLICY "Authenticated users can view seo_settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert seo_settings" ON seo_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update seo_settings" ON seo_settings FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete seo_settings" ON seo_settings FOR DELETE USING (true);

-- Inserir móveis de exemplo
INSERT INTO products (name, description, category, price, cost_price, stock_quantity, min_stock) VALUES
('Sofá 3 Lugares Retrátil', 'Sofá confortável com tecido suede, assento retrátil e encosto reclinável', 'Sala de Estar', 2499.90, 1500.00, 8, 3),
('Mesa de Jantar 6 Lugares', 'Mesa de jantar em madeira maciça com acabamento em verniz', 'Sala de Jantar', 1899.00, 1100.00, 5, 2),
('Guarda-Roupa 6 Portas', 'Guarda-roupa espaçoso com espelho e gavetas internas', 'Quarto', 2199.00, 1300.00, 4, 2),
('Cama Box Queen', 'Cama box queen size com colchão de molas ensacadas', 'Quarto', 1799.00, 1000.00, 6, 3),
('Rack para TV 65"', 'Rack moderno para TV até 65 polegadas com nichos e gavetas', 'Sala de Estar', 899.00, 500.00, 12, 5),
('Poltrona Decorativa', 'Poltrona elegante em veludo com pés palito', 'Sala de Estar', 699.00, 400.00, 10, 4),
('Mesa de Centro', 'Mesa de centro redonda em MDF com pés de madeira', 'Sala de Estar', 449.00, 250.00, 15, 5),
('Cadeira de Escritório', 'Cadeira ergonômica com ajuste de altura e apoio lombar', 'Escritório', 599.00, 350.00, 8, 3),
('Escrivaninha com Gavetas', 'Escrivaninha compacta ideal para home office', 'Escritório', 499.00, 280.00, 7, 3),
('Estante para Livros', 'Estante alta com 5 prateleiras em MDF branco', 'Escritório', 389.00, 220.00, 9, 4),
('Cômoda 5 Gavetas', 'Cômoda clássica em madeira com puxadores metálicos', 'Quarto', 799.00, 450.00, 6, 3),
('Painel para TV', 'Painel de parede para TV com LED embutido', 'Sala de Estar', 649.00, 380.00, 11, 4),
('Conjunto Sala de Jantar', 'Mesa com 4 cadeiras estofadas em courino', 'Sala de Jantar', 1599.00, 950.00, 3, 2),
('Beliche Infantil', 'Beliche em MDF com escada e grade de proteção', 'Quarto', 1299.00, 750.00, 4, 2),
('Aparador de Entrada', 'Aparador elegante para hall de entrada com espelho', 'Decoração', 549.00, 320.00, 7, 3);

-- Inserir configurações SEO padrão
INSERT INTO seo_settings (page_name, title, description, keywords) VALUES
('home', 'Móveis Paraíso - Os Melhores Móveis para Sua Casa', 'Encontre os melhores móveis para sua casa na Móveis Paraíso. Sofás, camas, mesas e muito mais com qualidade e preço justo.', 'móveis, sofá, cama, mesa, guarda-roupa, decoração, loja de móveis'),
('products', 'Nossos Produtos - Móveis Paraíso', 'Confira nosso catálogo completo de móveis para sala, quarto, escritório e muito mais.', 'catálogo móveis, produtos, móveis para casa'),
('contact', 'Contato - Móveis Paraíso', 'Entre em contato conosco. Estamos prontos para ajudar você a encontrar o móvel perfeito.', 'contato, atendimento, móveis paraíso');
