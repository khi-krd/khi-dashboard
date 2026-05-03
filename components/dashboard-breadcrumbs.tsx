"use client"

import Link from "next/link"
import * as React from "react"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/** Kurdish labels for first path segment — matches sidebar module routes. */
const SEGMENT_LABELS: Record<string, string> = {
  news: "هەواڵەکان",
  projects: "پرۆژەکان",
  writings: "نووسراوەکان",
  images: "کۆکراوەی وێنەکان",
  soundtracks: "ئاوازەکان",
  videos: "ڤیدیۆکان",
  about: "دەربارە",
  service: "خزمەتگوزاری",
  contact: "پەیوەندی",
}

function labelForSegment(segment: string): string {
  const decoded = decodeURIComponent(segment)
  return SEGMENT_LABELS[decoded] ?? decoded
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs: { href: string; label: string }[] =
    segments.length === 0
      ? [{ href: "/", label: "داشبۆرد" }]
      : [
          { href: "/", label: "داشبۆرد" },
          ...segments.map((seg, i) => ({
            href: `/${segments.slice(0, i + 1).join("/")}`,
            label: labelForSegment(seg),
          })),
        ]

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <React.Fragment key={crumb.href}>
              {index > 0 ? (
                <BreadcrumbSeparator className="hidden md:block" />
              ) : null}
              <BreadcrumbItem
                className={isLast ? undefined : "hidden md:block"}
              >
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
