import { AboutDetailClient } from "@/components/about/about-detail-client"

export default async function AboutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <AboutDetailClient aboutId={num} />
}
