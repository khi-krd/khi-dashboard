"use client"

import {
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  LinkIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { AboutStatusPill } from "@/components/about/about-status-pill"
import {
  BLOCK_TYPE_VARIANTS,
  BlockTypeIcon,
} from "@/components/about/block-type-pill"
import { CompletionBar } from "@/components/about/completion-bar"
import { NS } from "@/components/about/about-strings"
import { SeoCountChip } from "@/components/about/seo-count-chip"
import { SlugChip } from "@/components/about/slug-chip"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { blockCountsByType, computeAboutCompletion } from "@/lib/validations/about"
import { aboutPublicUrl } from "@/lib/about-url-helpers"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { AboutDto } from "@/types/about"

const divider = "border-border/60 -mx-5 border-t"

export function AboutDetailSidebar({ about }: { about: AboutDto }) {
  const { copyToClipboard } = useCopyToClipboard()
  const counts = blockCountsByType(about.blocks ?? [])
  const formLike = {
    titleCkb: about.titleCkb,
    titleKmr: about.titleKmr,
    subtitleCkb: about.subtitleCkb,
    subtitleKmr: about.subtitleKmr,
    seoDescriptionCkb: about.seoDescriptionCkb,
    seoDescriptionKmr: about.seoDescriptionKmr,
    blocks: about.blocks ?? [],
  }
  const ckbScore = computeAboutCompletion(formLike, "CKB")
  const kmrScore = computeAboutCompletion(formLike, "KMR")
  const slug = about.slugCkb?.trim()

  return (
    <aside className="border-border bg-card space-y-5 rounded-xl border p-5 text-sm lg:sticky lg:top-20 lg:self-start">
      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.page_status}
        </h4>
        <AboutStatusPill
          status={about.status}
          className="w-full justify-center py-1.5"
          size="large"
        />
        <div className="mt-4 space-y-3">
          {about.contentLanguages.includes("CKB") ? (
            <CompletionBar lang="ckb" score={ckbScore} />
          ) : null}
          {about.contentLanguages.includes("KMR") ? (
            <CompletionBar lang="kmr" score={kmrScore} />
          ) : null}
        </div>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.slugs}
        </h4>
        <div className="space-y-1.5">
          <SlugChip lang="ckb" value={about.slugCkb} />
          <SlugChip lang="kmr" value={about.slugKmr} />
        </div>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.seo}
        </h4>
        <dl className="space-y-2 text-xs">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">
              {NS.sidebar.seo_title}
            </dt>
            <dd>
              <SeoCountChip
                value={about.titleCkb?.length ?? 0}
                max={60}
                titleMax
              />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">
              {NS.sidebar.seo_desc}
            </dt>
            <dd>
              <SeoCountChip
                value={about.seoDescriptionCkb?.length ?? 0}
                max={160}
              />
            </dd>
          </div>
        </dl>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.blocks}
        </h4>
        <dl className="space-y-1 text-xs">
          {(Object.keys(BLOCK_TYPE_VARIANTS) as (keyof typeof BLOCK_TYPE_VARIANTS)[]).map(
            (type) => {
              const count = counts[type] ?? 0
              if (count <= 0) return null
              return (
                <div
                  key={type}
                  className="flex items-center justify-between gap-2"
                >
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <BlockTypeIcon type={type} className="size-3.5" />
                    {BLOCK_TYPE_VARIANTS[type].label}
                  </dt>
                  <dd className="font-mono">{formatCkbDigits(count)}</dd>
                </div>
              )
            },
          )}
          <div className="border-border/30 text-foreground mt-1.5 flex items-center justify-between border-t pt-1.5 font-medium">
            <dt>{NS.sidebar.total}</dt>
            <dd className="font-mono">
              {formatCkbDigits(about.blocks?.length ?? 0)}
            </dd>
          </div>
        </dl>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.actions}
        </h4>
        <div className="space-y-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start"
            disabled={!slug}
            onClick={() => {
              if (!slug) return
              copyToClipboard(aboutPublicUrl(slug))
              toast(NS.toast.copied)
            }}
          >
            <LinkIcon className="me-2 size-3.5" />
            {NS.action.copy_url}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start"
            disabled
          >
            <DocumentDuplicateIcon className="me-2 size-3.5" />
            {NS.action.copy_page}
          </Button>
          {about.status === "ACTIVE" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start"
              disabled
            >
              <ArchiveBoxIcon className="me-2 size-3.5" />
              {NS.action.archive}
            </Button>
          ) : null}
        </div>
      </section>
    </aside>
  )
}
