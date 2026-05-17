import { WritingDetailClient } from "@/components/writings/writing-detail-client"

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = Number(id)
  return <WritingDetailClient writingId={numId} />
}
