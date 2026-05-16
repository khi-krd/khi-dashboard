import { VideoDetailClient } from "@/components/videos/video-detail-client"

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <VideoDetailClient videoId={num} />
}
