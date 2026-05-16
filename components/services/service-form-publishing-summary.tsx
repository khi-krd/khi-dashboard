"use client"

import { useFormContext } from "react-hook-form"

import { ServiceFormSectionCard } from "@/components/services/service-form-section-card"
import { ServiceStatusPill } from "@/components/services/service-status-pill"
import { NS } from "@/components/services/services-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { ServiceFormValues } from "@/lib/validations/services"

export function ServiceFormPublishingSummary({
  hasCover,
}: {
  hasCover: boolean
}) {
  const { watch } = useFormContext<ServiceFormValues>()
  const serviceType = watch("serviceType")?.trim()
  const collections = watch("mediaCollections") ?? []
  const fileCount = collections.reduce(
    (sum, c) => sum + (c.files?.length ?? 0),
    0,
  )
  const active = watch("active")
  const publishedAt = watch("publishedAt")

  const rows = [
    {
      label: NS.summary.type,
      value: serviceType || NS.summary.none,
    },
    {
      label: NS.summary.collections,
      value: formatCkbDigits(collections.length),
    },
    {
      label: NS.summary.files,
      value: formatCkbDigits(fileCount),
    },
    {
      label: NS.summary.cover,
      value: hasCover ? NS.summary.coverSet : NS.summary.none,
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
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </ServiceFormSectionCard>
  )
}
