import type { ReactNode } from "react"

export default function ProjectsSegmentLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-3">{children}</div>
  )
}
