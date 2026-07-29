"use client"

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

import { AboutLanguageChipRow } from "@/components/about/about-language-chip"
import { ContactStatusPill } from "@/components/contact/contact-status-pill"
import { NS } from "@/components/contact/contact-strings"
import { SlugChip } from "@/components/about/slug-chip"
import { Button } from "@/components/ui/button"
import { contactDisplayTitle } from "@/lib/contact-normalize"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatRelativeTimeKu } from "@/lib/news-relative-time"
import { cn } from "@/lib/utils"
import { contactContentLanguages } from "@/types/contact-ui"
import type { ContactAdminTableRow } from "@/types/contact-ui"

export function ContactsTable({
  rows,
  pageIndex,
  pageSize,
  totalElements,
  onPageChange,
  onDelete,
}: {
  rows: ContactAdminTableRow[]
  pageIndex: number
  pageSize: number
  totalElements: number
  onPageChange: (page: number) => void
  onDelete: (row: ContactAdminTableRow) => void
}) {
  const router = useRouter()
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const from = totalElements === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalElements)
  const isFirstPage = pageIndex <= 0
  const isLastPage = pageIndex >= totalPages - 1

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border text-muted-foreground/80 border-b text-xs font-medium">
              <th className="w-14 py-2.5 text-start">{NS.table.id}</th>
              <th className="w-44 py-2.5 text-start">{NS.table.slugs}</th>
              <th className="py-2.5 text-start">{NS.table.title}</th>
              <th className="w-36 py-2.5 text-start">{NS.table.contact}</th>
              <th className="w-24 py-2.5 text-start">{NS.table.language}</th>
              <th className="w-24 py-2.5 text-start">{NS.table.status}</th>
              <th className="w-28 py-2.5 text-start">{NS.table.date}</th>
              <th className="w-28 py-2.5 text-start" />
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {rows.map((contact) => {
              const id = contact.id!
              const langs = contactContentLanguages(contact)
              return (
                <tr
                  key={id}
                  className="group hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => router.push("/dashboard/contact")}
                >
                  <td className="text-muted-foreground py-3 font-mono text-xs">
                    #{formatCkbDigits(id)}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col gap-1">
                      <SlugChip lang="ckb" value={contact.slugCkb} />
                      <SlugChip lang="kmr" value={contact.slugKmr} />
                    </div>
                  </td>
                  <td className="min-w-0 py-3">
                    <div className="truncate font-medium">
                      {contactDisplayTitle(contact) ? (
                        contactDisplayTitle(contact)
                      ) : (
                        <em className="text-muted-foreground/60">—</em>
                      )}
                    </div>
                    {contact.kmrContent?.title?.trim() ? (
                      <div className="text-muted-foreground mt-0.5 truncate text-xs">
                        {contact.kmrContent.title}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3">
                    <div className="text-muted-foreground truncate text-xs">
                      {contact.phone?.trim() || "—"}
                    </div>
                    {contact.email?.trim() ? (
                      <div className="text-muted-foreground/70 mt-0.5 truncate text-xs">
                        {contact.email}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3">
                    <AboutLanguageChipRow langs={langs} />
                  </td>
                  <td className="py-3">
                    <ContactStatusPill active={contact.active} />
                  </td>
                  <td className="text-muted-foreground py-3 font-mono text-xs">
                    {contact.updatedAt
                      ? formatRelativeTimeKu(contact.updatedAt)
                      : "—"}
                  </td>
                  <td className="py-3">
                    <div
                      className={cn(
                        "flex items-center gap-0.5 transition-opacity",
                        "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => router.push("/dashboard/contact")}
                        aria-label={NS.action.view}
                      >
                        <EyeIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() =>
                          router.push("/dashboard/contact")
                        }
                        aria-label={NS.action.edit}
                      >
                        <PencilSquareIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive size-7"
                        onClick={() => onDelete(contact)}
                        aria-label={NS.action.delete}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalElements > pageSize ? (
        <div className="border-border text-muted-foreground flex items-center justify-between gap-3 border-t px-4 py-2.5 text-xs">
          <span>
            ڕیزی {formatCkbDigits(from)}–{formatCkbDigits(to)} لە{" "}
            {formatCkbDigits(totalElements)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={isFirstPage}
              onClick={() => onPageChange(pageIndex - 1)}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
            <span className="px-2 font-mono">
              {formatCkbDigits(pageIndex + 1)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={isLastPage}
              onClick={() => onPageChange(pageIndex + 1)}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
