import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapInternalStatusToFiscal } from '@/lib/fiscal/focus'

export const runtime = 'nodejs'

function extractReference(payload: Record<string, unknown>): string | null {
  const values = [
    payload.ref,
    payload.referencia,
    payload.reference,
    payload?.documento && typeof payload.documento === 'object'
      ? (payload.documento as Record<string, unknown>).ref
      : null,
  ]

  const reference = values.find((value) => typeof value === 'string' && value.trim().length > 0)
  return typeof reference === 'string' ? reference : null
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>
    const reference = extractReference(payload)

    if (!reference) {
      return NextResponse.json({ error: 'Webhook sem reference/ref' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: fiscalDoc } = await supabase
      .from('fiscal_documents')
      .select('*')
      .eq('reference', reference)
      .maybeSingle()

    if (!fiscalDoc) {
      return NextResponse.json({ error: 'Documento fiscal não encontrado' }, { status: 404 })
    }

    const focusStatus =
      (payload.status as string | undefined) ||
      (payload.situacao as string | undefined) ||
      (payload.status_sefaz as string | undefined)

    const normalizedStatus = mapInternalStatusToFiscal(focusStatus)

    await supabase
      .from('fiscal_documents')
      .update({
        status: normalizedStatus,
        access_key:
          (payload.chave as string | undefined) ||
          (payload.chave_acesso as string | undefined) ||
          fiscalDoc.access_key,
        protocol: (payload.protocolo as string | undefined) || fiscalDoc.protocol,
        xml_url: (payload.url_xml as string | undefined) || fiscalDoc.xml_url,
        danfe_url:
          (payload.url_danfe as string | undefined) ||
          (payload.danfe as string | undefined) ||
          fiscalDoc.danfe_url,
        focus_response: payload,
        authorized_at:
          normalizedStatus === 'authorized' && !fiscalDoc.authorized_at
            ? new Date().toISOString()
            : fiscalDoc.authorized_at,
        cancelled_at:
          normalizedStatus === 'cancelled' && !fiscalDoc.cancelled_at
            ? new Date().toISOString()
            : fiscalDoc.cancelled_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fiscalDoc.id)

    await supabase.from('fiscal_document_events').insert({
      fiscal_document_id: fiscalDoc.id,
      event_type: 'webhook',
      event_payload: payload,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha no webhook fiscal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
