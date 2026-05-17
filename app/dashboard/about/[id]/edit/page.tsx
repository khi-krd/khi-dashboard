import { AboutForm } from "@/components/about/about-form"

export default async function EditAboutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <AboutForm mode="edit" aboutId={num} />
}
