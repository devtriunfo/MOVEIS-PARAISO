import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildFocusAuthorizationHeader,
  mapInternalStatusToFiscal,
  type FocusDocumentType,
  type FiscalCompanySettings,
} from '@/lib/fiscal/focus'

export const runtime = 'nodejs'

function getDocumentType(searchParams: URLSearchParams): FocusDocumentType {
  const type = searchParams.get('document_type')
  return type === 'nfe' ? 'nfe' : 'nfce'
}

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await context.params

    if (!reference) {
      return NextResponse.json({ error: 'reference é obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()
    const url = new URL(request.url)
    const documentType = getDocumentType(url.searchParams)

    const { data: settings } = await supabase
      .from('fiscal_company_settings')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const focusToken = settings?.focus_token || process.env.FOCUS_NFE_TOKEN || null

    if (!focusToken) {
      return NextResponse.json(
        { error: 'focus_token não configurado em fiscal_company_settings ou FOCUS_NFE_TOKEN' },
        { status: 400 },
      )
    }

    const fiscalSettings = settings as FiscalCompanySettings
    const endpoint = `${fiscalSettings.focus_api_url.replace(/\/$/, '')}/${documentType}/${encodeURIComponent(reference)}`

    const focusResponse = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: buildFocusAuthorizationHeader(focusToken),
        'Content-Type': 'application/json',
      },
    })

    const focusBody = await focusResponse.json().catch(() => ({}))
    const normalizedStatus = mapInternalStatusToFiscal(
      focusBody?.status || focusBody?.situacao || focusBody?.status_sefaz,
    )

    const { data: fiscalDoc } = await supabase
      .from('fiscal_documents')
      .select('*')
      .eq('reference', reference)
      .maybeSingle()

    if (fiscalDoc) {
      await supabase
        .from('fiscal_documents')
        .update({
          status: normalizedStatus,
          access_key: focusBody?.chave || focusBody?.chave_acesso || fiscalDoc.access_key,
          protocol: focusBody?.protocolo || fiscalDoc.protocol,
          xml_url: focusBody?.url_xml || fiscalDoc.xml_url,
          danfe_url: focusBody?.url_danfe || focusBody?.danfe || fiscalDoc.danfe_url,
          focus_response: focusBody,
          authorized_at:
            normalizedStatus === 'authorized' && !fiscalDoc.authorized_at
              ? new Date().toISOString()
              : fiscalDoc.authorized_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fiscalDoc.id)

      await supabase.from('fiscal_document_events').insert({
        fiscal_document_id: fiscalDoc.id,
        event_type: 'status_check',
        event_payload: {
          focus_status: focusBody?.status ?? null,
          normalized_status: normalizedStatus,
        },
      })
    }

    return NextResponse.json(
      {
        reference,
        status: normalizedStatus,
        focus_response: focusBody,
      },
      { status: focusResponse.ok ? 200 : 502 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao consultar status fiscal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
