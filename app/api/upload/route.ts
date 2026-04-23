import { put, del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo inválido. Use JPG, PNG, WebP ou GIF.' }, { status: 400 })
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })
    }

    // Upload para Vercel Blob (private store)
    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: 'private',
    })

    // Retorna o pathname para uso com a rota de servir arquivos
    return NextResponse.json({ url: `/api/file?pathname=${encodeURIComponent(blob.pathname)}`, pathname: blob.pathname })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 })
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar:', error)
    return NextResponse.json({ error: 'Falha ao deletar' }, { status: 500 })
  }
}
