"use client"

import {
  ReklamVideoManager,
  type ReklamVideoStrings,
} from "@/components/shared/reklam-video-manager"
import { VideoBreadcrumbBar } from "@/components/videos/video-breadcrumb"
import { NS } from "@/components/videos/videos-strings"
import { FILM_REKLAM_VIDEO } from "@/lib/reklam-video"

const STRINGS: ReklamVideoStrings = {
  title: NS.reklam.page.title,
  subtitle: NS.reklam.page.subtitle,
  statusActive: NS.reklam.status_active,
  statusEmpty: NS.reklam.status_empty,
  helper: NS.reklam.helper,
  notes: [...NS.reklam.notes],
  maxSizeLabel: NS.reklam.max_size,
  upload: NS.reklam.upload,
  replace: NS.reklam.replace,
  uploading: NS.reklam.uploading,
  dropHint: NS.reklam.drop_hint,
  dropReplace: NS.reklam.drop_replace,
  copyUrl: NS.reklam.copy_url,
  emptyTitle: NS.reklam.empty.title,
  emptySubtitle: NS.reklam.empty.subtitle,
  deleteTitle: NS.reklam.delete.title,
  deleteBody: NS.reklam.delete.body,
  metaSize: NS.reklam.meta.size,
  metaMime: NS.reklam.meta.mime,
  metaUpdatedAt: NS.system.updated_at,
  metaCreatedAt: NS.system.created_at,
  conflict: NS.reklam.conflict,
  alreadyGone: NS.reklam.already_gone,
  toastCreated: NS.toast.reklam_created,
  toastUpdated: NS.toast.reklam_updated,
  toastDeleted: NS.toast.reklam_deleted,
  toastCopied: NS.toast.copied,
  errorGeneric: NS.error.generic,
  errorForbidden: NS.error.forbidden,
  errorRetry: NS.error.retry,
  actionDelete: NS.action.delete,
  actionCancel: NS.action.cancel,
  actionBack: NS.action.back,
  dash: NS.dash,
}

export function FilmReklamVideoClient() {
  return (
    <ReklamVideoManager
      config={FILM_REKLAM_VIDEO}
      strings={STRINGS}
      backHref="/dashboard/videos"
      breadcrumb={
        <VideoBreadcrumbBar
          segments={[
            { label: NS.breadcrumb.dashboard, href: "/dashboard" },
            { label: NS.breadcrumb.videos, href: "/dashboard/videos" },
            { label: NS.breadcrumb.reklam },
          ]}
        />
      }
    />
  )
}
