import { ProjectForm } from "@/components/projects/project-form"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <ProjectForm mode="edit" projectId={num} />
}
