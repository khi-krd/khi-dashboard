"use client"

import { LinkIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import { AboutStatusPill } from "@/components/about/about-status-pill"
import { CompletionBar } from "@/components/about/completion-bar"
import { NS } from "@/components/about/about-strings"
import { SeoCountChip } from "@/components/about/seo-count-chip"
import { SlugChip } from "@/components/about/slug-chip"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { computeAboutCompletion } from "@/lib/validations/about"
import { aboutPublicUrl } from "@/lib/about-url-helpers"
import { aboutContentLanguages } from "@/types/about-ui"
import type { AboutDto } from "@/types/about"

const divider = "border-border/60 -mx-5 border-t"

export function AboutDetailSidebar({ about }: { about: AboutDto }) {
  const { copyToClipboard } = useCopyToClipboard()
  const langs = aboutContentLanguages(about)
  const formLike = {
    titleCkb: about.ckbContent?.title,
    titleKmr: about.kmrContent?.title,
    subtitleCkb: about.ckbContent?.subtitle,
    subtitleKmr: about.kmrContent?.subtitle,
    seoDescriptionCkb: about.ckbContent?.metaDescription,
    seoDescriptionKmr: about.kmrContent?.metaDescription,
    bodyCkb: about.ckbContent?.body,
    bodyKmr: about.kmrContent?.body,
  }
  const ckbScore = computeAboutCompletion(formLike, "CKB")
  const kmrScore = computeAboutCompletion(formLike, "KMR")
  const slug = about.slugCkb?.trim()

  return (
    <aside className="border-border bg-card space-y-5 rounded-xl border p-5 text-sm lg:sticky lg:top-20 lg:self-start">
      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.visibility}
        </h4>
        <AboutStatusPill
          active={about.active}
          className="w-full justify-center py-1.5"
          size="large"
        />
        <div className="mt-4 space-y-3">
          {langs.includes("CKB") ? (
            <CompletionBar lang="ckb" score={ckbScore} />
          ) : null}
          {langs.includes("KMR") ? (
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
                value={about.ckbContent?.title?.length ?? 0}
                max={300}
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
                value={about.ckbContent?.metaDescription?.length ?? 0}
                max={2500}
              />
            </dd>
          </div>
        </dl>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.actions}
        </h4>
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
      </section>
    </aside>
  )
}
