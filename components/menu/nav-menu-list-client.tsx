"use client"

import { useMemo } from "react"

import { NavMenuErrorState } from "@/components/menu/nav-menu-error-state"
import { NavMenuItemCard } from "@/components/menu/nav-menu-item-card"
import { NM } from "@/components/menu/nav-menu-strings"
import {
  ServiceBreadcrumbBar,
  dashboardServicesCrumbHref,
} from "@/components/services/service-breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavMenuListQuery } from "@/hooks/useNavMenu"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"

function ListSkeleton() {
  return (
    <div className="space-y-3" dir="rtl">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
  )
}

/**
 * The menu's links listed flat — the website owns the section set and its
 * labels, so there is no add/delete here; each row only takes a background
 * photo.
 */
export function NavMenuListClient() {
  // The dashboard always wants hidden rows too, so their images stay editable.
  const listQuery = useNavMenuListQuery(true)
  const items = useMemo(() => listQuery.data ?? [], [listQuery.data])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-16" dir="rtl">
      <ServiceBreadcrumbBar
        segments={[
          { label: NM.breadcrumb.dashboard, href: dashboardServicesCrumbHref() },
          { label: NM.breadcrumb.menu },
        ]}
      />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {NM.page.title}
        </h1>
        <p className="text-muted-foreground text-sm">{NM.page.subtitle}</p>
      </header>

      {listQuery.isError ? (
        <NavMenuErrorState
          message={
            extractApiErrorMessage(listQuery.error) ?? NM.error.generic
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{NM.page.itemsTitle}</h2>
            <p className="text-muted-foreground text-xs">
              {NM.page.totalCount(formatCkbDigits(items.length))}
            </p>
          </div>

          {listQuery.isLoading ? (
            <ListSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.length === 0 ? (
                <p className="text-muted-foreground/70 py-8 text-center text-sm md:col-span-2">
                  {NM.page.empty}
                </p>
              ) : null}

              {items.map((item, index) => (
                <NavMenuItemCard
                  // `imageUrl` in the key remounts the card when the server
                  // value changes, so the staged URL re-seeds without an
                  // effect (React Compiler forbids setState-in-effect).
                  key={`${item.id ?? `row-${index}`}:${item.imageUrl ?? ""}`}
                  index={index}
                  dto={item}
                  onSaved={() => void listQuery.refetch()}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
