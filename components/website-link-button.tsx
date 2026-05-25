"use client"

import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { aboutSiteBaseUrl, publicSiteLabel } from "@/lib/about-url-helpers"
import { cn } from "@/lib/utils"
import { LinkIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function WebsiteLinkButton() {
  const t = useTranslations("Sidebar.a11y")
  const href = aboutSiteBaseUrl()
  const label = publicSiteLabel()

  if (!href || !label) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${t("openWebsite")}: ${label}`}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "h-8 shrink-0 gap-1.5 px-2.5",
      )}
    >
      <HugeiconsIcon
        icon={LinkIcon}
        strokeWidth={2}
        aria-hidden="true"
        className="size-4"
      />
      <span>{label}</span>
    </a>
  )
}
