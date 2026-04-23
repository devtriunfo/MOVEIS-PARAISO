import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('customers')
      .insert(body)
      .select()
      .single()
    
    if (error) {
      console.error('[v0] Error creating customer:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('[v0] Error updating customer:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('[v0] Error deleting customer:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Error:', err)
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 })
  }
}
