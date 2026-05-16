import { ServiceForm } from "@/components/services/service-form"

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <ServiceForm mode="edit" serviceId={num} />
}
