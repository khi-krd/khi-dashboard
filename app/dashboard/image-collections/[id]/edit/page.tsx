import { CollectionForm } from "@/components/image-collections/collection-form"

export default async function EditImageCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CollectionForm mode="edit" collectionId={Number(id)} />
}
