import { getCategories } from '@/lib/actions/categories'
import { CategoriasClient } from './categorias-client'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const categories = await getCategories()

  return <CategoriasClient categories={categories} />
}