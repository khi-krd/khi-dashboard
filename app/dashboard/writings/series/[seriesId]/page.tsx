import { SeriesDetailClient } from "@/components/writings/series-detail-client"

export default async function WritingsSeriesDetailPage({
  params,
}: {
  params: Promise<{ seriesId: string }>
}) {
  const { seriesId } = await params
  return <SeriesDetailClient seriesId={decodeURIComponent(seriesId)} />
}
