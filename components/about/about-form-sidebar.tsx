"use client"

import { CheckIcon } from "@heroicons/react/24/outline"
import { useFormContext } from "react-hook-form"

import { STATUS_VARIANTS } from "@/components/about/about-status-pill"
import { CompletionBar } from "@/components/about/completion-bar"
import { NS } from "@/components/about/about-strings"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  computeAboutCompletion,
  type AboutFormValues,
} from "@/lib/validations/about"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { AboutDto } from "@/types/about"

const divider = "border-border/60 -mx-5 border-t"

export function AboutFormSidebar({
  mode,
  editDto,
}: {
  mode: "create" | "edit"
  editDto?: AboutDto
}) {
  const { watch, setValue } = useFormContext<AboutFormValues>()
  const status = watch("status")
  const contentLanguages = watch("contentLanguages")
  const values = watch()

  const ckbScore = computeAboutCompletion(values, "CKB")
  const kmrScore = computeAboutCompletion(values, "KMR")
  const statusVariant = STATUS_VARIANTS[status]

  return (
    <aside className="border-border bg-card space-y-5 self-start rounded-xl border p-5 text-sm lg:sticky lg:top-20">
      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.page_status}
        </h4>
        <div className="bg-muted/40 grid grid-cols-3 gap-1 rounded-lg p-1">
          {(["DRAFT", "ACTIVE", "ARCHIVED"] as const).map((s) => {
            const variant = STATUS_VARIANTS[s]
            const Icon = variant.icon
            const isActive = status === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setValue("status", s, { shouldDirty: true })}
                className={cn(
                  "flex items-center justify-center gap-1 rounded-md py-1.5 text-xs transition-all",
                  isActive
                    ? `${variant.className} font-medium shadow-sm`
                    : "text-muted-foreground hover:bg-background/60",
                )}
              >
                <Icon className="size-3" />
                {variant.label}
              </button>
            )
          })}
        </div>
        <p
          className={cn(
            "mt-2 text-xs",
            status === "ACTIVE" ? "text-primary" : "text-muted-foreground",
          )}
        >
          {statusVariant.helper}
        </p>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.completion}
        </h4>
        <div className="space-y-3">
          {contentLanguages.includes("CKB") ? (
            <CompletionBar lang="ckb" score={ckbScore} />
          ) : null}
          {contentLanguages.includes("KMR") ? (
            <CompletionBar lang="kmr" score={kmrScore} />
          ) : null}
        </div>
        <p className="text-muted-foreground mt-2.5 text-[11px] leading-relaxed">
          {NS.sidebar.completion_hint}
        </p>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.languages}
        </h4>
        <div className="flex gap-1.5">
          {(["CKB", "KMR"] as const).map((lang) => {
            const on = contentLanguages.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  const next = on
                    ? contentLanguages.filter((l) => l !== lang)
                    : [...contentLanguages, lang]
                  if (next.length) {
                    setValue("contentLanguages", next, { shouldDirty: true })
                  }
                }}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
                  on
                    ? lang === "CKB"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                    : "border-border bg-muted/30 text-muted-foreground",
                )}
              >
                <CheckIcon className={cn("size-3", !on && "opacity-30")} />
                {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
              </button>
            )
          })}
        </div>
      </section>

      {mode === "edit" && editDto?.id ? (
        <>
          <div className={divider} />
          <section>
            <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
              {NS.sidebar.system}
            </h4>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{NS.sidebar.id}</dt>
                <dd className="font-mono">#{formatCkbDigits(editDto.id)}</dd>
              </div>
              {editDto.createdAt ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{NS.sidebar.created}</dt>
                  <dd className="font-mono text-end">
                    {formatRelativeTimeKu(editDto.createdAt)}
                  </dd>
                </div>
              ) : null}
              {editDto.updatedAt ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{NS.sidebar.updated}</dt>
                  <dd
                    className="font-mono text-end"
                    title={formatFullTimestampKu(editDto.updatedAt)}
                  >
                    {formatRelativeTimeKu(editDto.updatedAt)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </>
      ) : null}
    </aside>
  )
}
