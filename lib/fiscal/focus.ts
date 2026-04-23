import type { Customer, Sale, SaleItem } from '@/lib/types'

export type FocusDocumentType = 'nfce' | 'nfe'

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
}

interface BuildPayloadInput {
  sale: Sale
  saleItems: SaleItem[]
  customer: Customer | null
  settings: FiscalCompanySettings
  documentType: FocusDocumentType
}

export function mapInternalStatusToFiscal(status?: string): string {
  if (!status) return 'processing'

  const normalized = status.toLowerCase()

  if (['autorizado', 'autorizada', 'authorized'].includes(normalized)) {
    return 'authorized'
  }

  if (['cancelado', 'cancelada', 'cancelled'].includes(normalized)) {
    return 'cancelled'
  }

  if (['rejeitado', 'rejeitada', 'error', 'erro', 'failed'].includes(normalized)) {
    return 'rejected'
  }

  return 'processing'
}

export function sanitizeDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '')
}

function mapPaymentMethod(method: string | null): string {
  const normalized = (method ?? '').toLowerCase().trim()

  if (normalized.includes('dinheiro') || normalized === 'cash') return '01'
  if (normalized.includes('debito') || normalized === 'debit') return '04'
  if (normalized.includes('credito') || normalized === 'credit') return '03'
  if (normalized.includes('pix')) return '17'
  if (normalized.includes('boleto')) return '15'

  return '99'
}

export function buildFocusPayload({
  sale,
  saleItems,
  customer,
  settings,
  documentType,
}: BuildPayloadInput) {
  const now = new Date().toISOString()
  const nature = documentType === 'nfce' ? 'VENDA NFC-e' : 'VENDA NF-e'

  const clienteCpfCnpj = sanitizeDigits(customer?.cpf)

  const items = saleItems.map((item, index) => ({
    numero_item: index + 1,
    codigo_produto: item.product_id ?? `ITEM-${index + 1}`,
    descricao: item.product_name,
    cfop: '5102',
    unidade_comercial: 'UN',
    quantidade_comercial: item.quantity,
    valor_unitario_comercial: item.unit_price,
    valor_bruto: item.total_price,
    ncm: '94036000',
    origem: '0',
  }))

  return {
    natureza_operacao: nature,
    data_emissao: now,
    tipo_documento: 1,
    finalidade_emissao: 1,
    consumidor_final: 1,
    presenca_comprador: 1,
    modalidade_frete: 9,
    local_destino: 1,
    serie: documentType === 'nfce' ? settings.nfce_series : settings.nfe_series,
    ambiente: settings.ambiente,
    emitente: {
      cnpj: sanitizeDigits(settings.cnpj),
      razao_social: settings.company_name,
      nome_fantasia: settings.company_name,
      inscricao_estadual: sanitizeDigits(settings.ie),
      endereco: settings.address_street,
      numero: settings.address_number,
      bairro: settings.address_district,
      municipio: settings.address_city,
      uf: settings.address_state,
      cep: sanitizeDigits(settings.address_zip_code),
      codigo_municipio: settings.address_city_ibge,
      telefone: sanitizeDigits(settings.phone),
      email: settings.email,
      regime_tributario: settings.regime_tributario,
    },
    destinatario:
      customer && clienteCpfCnpj
        ? {
            cpf: clienteCpfCnpj.length === 11 ? clienteCpfCnpj : undefined,
            cnpj: clienteCpfCnpj.length === 14 ? clienteCpfCnpj : undefined,
            nome: customer.name,
            endereco: customer.address ?? 'NAO INFORMADO',
            bairro: 'CENTRO',
            municipio: customer.city ?? settings.address_city,
            uf: customer.state ?? settings.address_state,
            cep: sanitizeDigits('00000000'),
            indicador_inscricao_estadual: 9,
            telefone: sanitizeDigits(customer.phone),
          }
        : undefined,
    items,
    formas_pagamento: [
      {
        forma_pagamento: mapPaymentMethod(sale.payment_method),
        valor_pagamento: sale.total_amount,
      },
    ],
  }
}

export function buildFocusAuthorizationHeader(token: string): string {
  const encoded = Buffer.from(`${token}:`).toString('base64')
  return `Basic ${encoded}`
}
