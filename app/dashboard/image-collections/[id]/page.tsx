import { CollectionDetailClient } from "@/components/image-collections/collection-detail-client"

export default async function ImageCollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CollectionDetailClient id={Number(id)} />
}
