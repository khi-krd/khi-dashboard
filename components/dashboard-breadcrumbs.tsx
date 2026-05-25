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

/** Kurdish labels for path segments under /dashboard. */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "داشبۆرد",
  news: "هەواڵەکان",
  new: "نوێ",
  edit: "دەستکاری",
  projects: "پرۆژەکان",
  services: "خزمەتگوزارییەکان",
  writings: "نووسراوەکان",
  topics: "بابەتەکان",
  series: "زنجیرەکان",
  images: "کۆکراوەی وێنەکان",
  "image-collections": "کۆکراوەی وێنەکان",
  soundtracks: "ئاوازەکان",
  sounds: "دەنگەکان",
  videos: "ڤیدیۆکان",
  about: "دەربارە",
  service: "خزمەتگوزاری",
  contact: "پەیوەندی",
  profile: "پرۆفایل",
  users: "بەکارهێنەران",
}

function labelForSegment(segment: string): string {
  const decoded = decodeURIComponent(segment)
  if (/^\d+$/.test(decoded)) return `#${decoded}`
  return SEGMENT_LABELS[decoded] ?? decoded
}

export function DashboardBreadcrumbs() {
  const pathname = usePathname()

  if (pathname.startsWith("/dashboard/news")) {
    return null
  }

  if (pathname.startsWith("/dashboard/projects")) {
    return null
  }

  if (pathname.startsWith("/dashboard/videos")) {
    return null
  }

  if (pathname.startsWith("/dashboard/services")) {
    return null
  }

  if (pathname.startsWith("/dashboard/sounds")) {
    return null
  }

  if (pathname.startsWith("/dashboard/image-collections")) {
    return null
  }

  if (pathname.startsWith("/dashboard/writings")) {
    return null
  }

  if (pathname.startsWith("/dashboard/about")) {
    return null
  }

  const segments = pathname.split("/").filter(Boolean)
  const tail =
    segments[0] === "dashboard" ? segments.slice(1) : segments

  const crumbs: { href: string; label: string }[] = [
    { href: "/dashboard", label: "داشبۆرد" },
    ...tail.map((seg, i) => ({
      href: `/dashboard/${tail.slice(0, i + 1).join("/")}`,
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
