import { ServiceDetailClient } from "@/components/services/service-detail-client"

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <ServiceDetailClient serviceId={num} />
}
