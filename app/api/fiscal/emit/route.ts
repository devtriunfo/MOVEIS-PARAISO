import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildFocusAuthorizationHeader,
  buildFocusPayload,
  mapInternalStatusToFiscal,
  type FocusDocumentType,
  type FiscalCompanySettings,
} from '@/lib/fiscal/focus'

export const runtime = 'nodejs'

interface EmitRequestBody {
  sale_id: string
  document_type: FocusDocumentType
}

function isValidDocumentType(value: string): value is FocusDocumentType {
  return value === 'nfce' || value === 'nfe'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmitRequestBody

    if (!body?.sale_id) {
      return NextResponse.json({ error: 'sale_id é obrigatório' }, { status: 400 })
    }

    if (!isValidDocumentType(body.document_type)) {
      return NextResponse.json({ error: 'document_type deve ser nfce ou nfe' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: settings, error: settingsError } = await supabase
      .from('fiscal_company_settings')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: 'Configure fiscal_company_settings antes de emitir documentos' },
        { status: 400 },
      )
    }

    const fiscalSettings = settings as FiscalCompanySettings

    const focusToken = fiscalSettings.focus_token || process.env.FOCUS_NFE_TOKEN || null

    if (!focusToken) {
      return NextResponse.json(
        { error: 'focus_token não configurado em fiscal_company_settings ou FOCUS_NFE_TOKEN' },
        { status: 400 },
      )
    }

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', body.sale_id)
      .single()

    if (saleError || !sale) {
      return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 })
    }

    const { data: saleItems, error: saleItemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', sale.id)
      .order('created_at', { ascending: true })

    if (saleItemsError || !saleItems?.length) {
      return NextResponse.json({ error: 'A venda não possui itens para emissão' }, { status: 400 })
    }

    let customer = null
    if (sale.customer_id) {
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', sale.customer_id)
        .maybeSingle()

      customer = customerData
    }

    if (body.document_type === 'nfe' && !customer) {
      return NextResponse.json(
        { error: 'NF-e exige cliente vinculado à venda' },
        { status: 400 },
      )
    }

    const reference = `${body.document_type}-${sale.id}-${Date.now()}`
    const payload = buildFocusPayload({
      sale,
      saleItems,
      customer,
      settings: fiscalSettings,
      documentType: body.document_type,
    })

    const endpoint = `${fiscalSettings.focus_api_url.replace(/\/$/, '')}/${body.document_type}?ref=${encodeURIComponent(reference)}`

    const focusResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: buildFocusAuthorizationHeader(focusToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const focusBody = await focusResponse.json().catch(() => ({}))
    const focusStatus = mapInternalStatusToFiscal(
      focusBody?.status || focusBody?.situacao || focusBody?.status_sefaz,
    )

    const { data: fiscalDocument, error: fiscalInsertError } = await supabase
      .from('fiscal_documents')
      .insert({
        sale_id: sale.id,
        customer_id: sale.customer_id,
        document_type: body.document_type,
        reference,
        status: focusResponse.ok ? focusStatus : 'rejected',
        request_payload: payload,
        focus_response: focusBody,
        error_message: focusResponse.ok ? null : JSON.stringify(focusBody),
      })
      .select('*')
      .single()

    if (fiscalInsertError) {
      return NextResponse.json(
        { error: `Falha ao salvar documento fiscal: ${fiscalInsertError.message}` },
        { status: 500 },
      )
    }

    if (saleItems.length) {
      await supabase.from('fiscal_document_items').insert(
        saleItems.map((item) => ({
          fiscal_document_id: fiscalDocument.id,
          sale_item_id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          ncm: '94036000',
          cfop: '5102',
          cst_csosn: '102',
        })),
      )
    }

    await supabase.from('fiscal_document_events').insert({
      fiscal_document_id: fiscalDocument.id,
      event_type: 'created',
      event_payload: {
        response_ok: focusResponse.ok,
        focus_status: focusBody?.status ?? null,
      },
    })

    return NextResponse.json(
      {
        id: fiscalDocument.id,
        reference,
        status: fiscalDocument.status,
        focus_response: focusBody,
      },
      { status: focusResponse.ok ? 200 : 502 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao emitir documento fiscal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
