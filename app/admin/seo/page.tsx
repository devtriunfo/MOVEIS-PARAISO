import { createClient } from '@/lib/supabase/server'
import { SeoClient } from '@/components/admin/seo-client'

export default async function SeoPage() {
  const supabase = await createClient()
  
  const { data: seoSettings } = await supabase
    .from('seo_settings')
    .select('*')
    .order('page_name')

  return <SeoClient initialSettings={seoSettings || []} />
}
