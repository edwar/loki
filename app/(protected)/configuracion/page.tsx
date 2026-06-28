import { getUserCompany } from '@/lib/actions/companies'
import { ConfiguracionClient } from './configuracion-client'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const company = await getUserCompany()

  const serialized = company
    ? {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logo: company.logo,
        description: company.description,
        whatsapp: company.whatsapp,
        email: company.email,
        address: company.address,
        isActive: company.isActive,
      }
    : null

  return <ConfiguracionClient company={serialized} />
}
