import { VideoForm } from "@/components/videos/video-form"

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <VideoForm mode="edit" videoId={num} />
}
