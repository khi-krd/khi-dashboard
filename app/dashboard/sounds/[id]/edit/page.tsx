import { SoundForm } from "@/components/sounds/sound-form"

export default async function EditSoundPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <SoundForm mode="edit" soundId={num} />
}
