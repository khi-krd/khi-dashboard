"use client"

import { useFormContext } from "react-hook-form"

import { ServiceFormSectionCard } from "@/components/services/service-form-section-card"
import { ServiceStatusPill } from "@/components/services/service-status-pill"
import { NS } from "@/components/services/services-strings"
import type { ServiceFormValues } from "@/lib/validations/services"

export function ServiceFormPublishingSummary() {
  const { watch } = useFormContext<ServiceFormValues>()
  const serviceType = watch("serviceType")?.trim()
  const active = watch("active")
  const publishedAt = watch("publishedAt")

  const rows = [
    {
      label: NS.summary.type,
      value: serviceType || NS.summary.none,
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
