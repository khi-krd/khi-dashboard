import { ContactDetailClient } from "@/components/contact/contact-detail-client"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <ContactDetailClient contactId={num} />
}
