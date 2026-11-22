"use client"

import { useState } from "react"
import { toast } from "sonner"

import { AboutSectionCardShell } from "@/components/about/about-section-card-shell"
import { NS } from "@/components/about/about-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/hooks/useSiteSettings"
import { toastApiError } from "@/lib/toast"

/**
 * The logo shown on the about page, to the physical left of the mission
 * text. Stored as `site_settings.aboutLogoUrl`; when empty the website
 * falls back to the header logo from Settings → Branding.
 */
export function AboutLogoSectionCard({ index }: { index: number }) {
  const settingsQ = useSiteSettingsQuery()
  const updateMut = useUpdateSiteSettingsMutation()
  const saved = settingsQ.data?.aboutLogoUrl ?? ""
  const [draft, setDraft] = useState<string | null>(null)
  const value = draft ?? saved

  return (
    <AboutSectionCardShell
      index={index}
      titlePreview={NS.logo.title}
      pending={updateMut.isPending}
      saveDisabled={draft === null || draft === saved || updateMut.isPending}
      onSave={() =>
        updateMut.mutate(
          { aboutLogoUrl: value.trim() },
          {
            onSuccess: () => {
              setDraft(null)
              toast.success(NS.logo.saved)
            },
            onError: (err) => toastApiError(err, NS.logo.error),
          },
        )
      }
    >
      <div className="max-w-56">
        <MediaCoverUpload
          entity="about"
          label={NS.logo.label}
          aspectClass="aspect-square"
          helperText={NS.logo.hint}
          previewUrl={value || null}
          urlValue={value}
          onUrlChange={setDraft}
        />
      </div>
    </AboutSectionCardShell>
  )
}
