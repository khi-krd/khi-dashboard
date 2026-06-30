import { ContactForm } from "@/components/contact/contact-form"

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <ContactForm mode="edit" contactId={num} />
}
