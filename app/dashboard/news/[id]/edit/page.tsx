import { NewsForm } from "@/components/news/news-form"

export default async function NewsEditRoutePage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const num = Number(id)
  return <NewsForm mode="edit" newsId={num} />
}
