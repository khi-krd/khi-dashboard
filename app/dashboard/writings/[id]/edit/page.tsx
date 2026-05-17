import { WritingForm } from "@/components/writings/writing-form"

export default async function EditWritingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <WritingForm mode="edit" writingId={num} />
}
