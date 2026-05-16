import { NewsDetailClient } from "@/components/news/news-detail-client"

export default async function NewsDetailRoutePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const num = Number(id)
  return <NewsDetailClient newsId={num} />
}
