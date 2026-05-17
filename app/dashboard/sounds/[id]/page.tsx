import { SoundDetailClient } from "@/components/sounds/sound-detail-client"

export default async function SoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = Number(id)
  return <SoundDetailClient soundId={numId} />
}
