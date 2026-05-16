import { ProjectDetailClient } from "@/components/projects/project-detail-client"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const num = Number(id)
  return <ProjectDetailClient projectId={num} />
}
