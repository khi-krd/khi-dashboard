import type { QueryClient } from "@tanstack/react-query"

import { projectKeys } from "@/lib/projects-query-keys"
import type { ProjectDto, ProjectTypeOption } from "@/types/projects"

function uniqTypes(rows: Iterable<ProjectDto>): ProjectTypeOption[] {
  const map = new Map<string, ProjectTypeOption>()
  for (const p of rows) {
    const ckb = p.projectTypeCkb?.trim()
    if (!ckb) continue
    map.set(ckb, {
      projectTypeCkb: ckb,
      projectTypeKmr: p.projectTypeKmr?.trim() ?? "",
    })
  }
  return [...map.values()].sort((a, b) =>
    a.projectTypeCkb.localeCompare(b.projectTypeCkb, "ckb"),
  )
}

export function mergeProjectsDerivedTypes(
  queryClient: QueryClient,
  rows: ProjectDto[],
): void {
  const pageTypes = uniqTypes(rows)
  if (!pageTypes.length) return
  queryClient.setQueryData(
    projectKeys.types(),
    (prev: ProjectTypeOption[] | undefined) => {
      const map = new Map<string, ProjectTypeOption>()
      for (const t of prev ?? []) {
        if (t.projectTypeCkb?.trim())
          map.set(t.projectTypeCkb.trim(), {
            projectTypeCkb: t.projectTypeCkb.trim(),
            projectTypeKmr: t.projectTypeKmr?.trim() ?? "",
          })
      }
      for (const t of pageTypes) map.set(t.projectTypeCkb, t)
      return [...map.values()].sort((a, b) =>
        a.projectTypeCkb.localeCompare(b.projectTypeCkb, "ckb"),
      )
    },
  )
}

export function pushInlineProjectType(
  queryClient: QueryClient,
  dto: ProjectTypeOption,
): void {
  const ckb = dto.projectTypeCkb.trim()
  if (!ckb) return
  const next: ProjectTypeOption = {
    projectTypeCkb: ckb,
    projectTypeKmr: dto.projectTypeKmr.trim(),
  }
  queryClient.setQueryData(
    projectKeys.types(),
    (prev: ProjectTypeOption[] | undefined) => {
      const map = new Map<string, ProjectTypeOption>()
      for (const t of prev ?? []) {
        if (t.projectTypeCkb?.trim())
          map.set(t.projectTypeCkb.trim(), {
            projectTypeCkb: t.projectTypeCkb.trim(),
            projectTypeKmr: t.projectTypeKmr?.trim() ?? "",
          })
      }
      map.set(ckb, next)
      return [...map.values()].sort((a, b) =>
        a.projectTypeCkb.localeCompare(b.projectTypeCkb, "ckb"),
      )
    },
  )
}
