import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('fiscal_company_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? null)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao consultar configuração fiscal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const payload = {
      ...body,
      focus_api_url: body.focus_api_url || 'https://api.focusnfe.com.br/v2',
      updated_at: new Date().toISOString(),
      is_active: true,
    }

    const { data: existing } = await supabase
      .from('fiscal_company_settings')
      .select('id')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing?.id) {
      const { data, error } = await supabase
        .from('fiscal_company_settings')
        .update(payload)
        .eq('id', existing.id)
        .select('*')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from('fiscal_company_settings')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao salvar configuração fiscal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
