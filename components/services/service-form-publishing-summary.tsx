"use client"

import { useFormContext } from "react-hook-form"

import { ServiceFormSectionCard } from "@/components/services/service-form-section-card"
import { ServiceStatusPill } from "@/components/services/service-status-pill"
import { NS } from "@/components/services/services-strings"
import type { ServiceFormValues } from "@/lib/validations/services"
import type { ServiceLayoutType } from "@/types/services"

const LAYOUT_LABEL: Record<ServiceLayoutType, string> = {
  MEDIA_HERO: NS.layout.MEDIA_HERO,
  FEATURE_GRID: NS.layout.FEATURE_GRID,
  DEFAULT: NS.layout.DEFAULT,
}

export function ServiceFormPublishingSummary() {
  const { watch } = useFormContext<ServiceFormValues>()
  const serviceType = watch("serviceType")?.trim()
  const navAnchorId = watch("navAnchorId")?.trim()
  const layoutType = watch("layoutType")
  const sortOrder = watch("sortOrder")
  const active = watch("active")
  const publishedAt = watch("publishedAt")

  const rows = [
    {
      label: NS.summary.type,
      value: serviceType || NS.summary.none,
    },
    {
      label: NS.summary.anchor,
      value: navAnchorId || NS.summary.none,
    },
    {
      label: NS.summary.layout,
      value: layoutType
        ? LAYOUT_LABEL[layoutType as ServiceLayoutType] ?? layoutType
        : NS.summary.none,
    },
    {
      label: NS.summary.sortOrder,
      value:
        typeof sortOrder === "number" && Number.isFinite(sortOrder)
          ? String(sortOrder)
          : NS.summary.none,
    },
  ]

  return (
    <ServiceFormSectionCard title={NS.section.publishing}>
      <ServiceStatusPill
        service={{ active, publishedAt: publishedAt ?? null }}
        className="w-full justify-center py-1.5"
      />
      <dl className="space-y-2 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-2"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="max-w-[60%] truncate text-end font-medium">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </ServiceFormSectionCard>
  )
}
