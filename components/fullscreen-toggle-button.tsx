"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { FullscreenIcon, MinimizeScreenIcon } from "@hugeicons/core-free-icons"

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null
    mozFullScreenElement?: Element | null
  }
  return (
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    null
  )
}

async function enterFullscreen() {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
    mozRequestFullScreen?: () => Promise<void> | void
  }
  if (el.requestFullscreen) {
    await el.requestFullscreen()
  } else if (el.webkitRequestFullscreen) {
    await Promise.resolve(el.webkitRequestFullscreen())
  } else if (el.mozRequestFullScreen) {
    await Promise.resolve(el.mozRequestFullScreen())
  }
}

async function exitFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void
    mozCancelFullScreen?: () => Promise<void> | void
  }
  if (doc.exitFullscreen) {
    await doc.exitFullscreen()
  } else if (doc.webkitExitFullscreen) {
    await Promise.resolve(doc.webkitExitFullscreen())
  } else if (doc.mozCancelFullScreen) {
    await Promise.resolve(doc.mozCancelFullScreen())
  }
}

export function FullscreenToggleButton() {
  const t = useTranslations("Sidebar.a11y")
  const [active, setActive] = useState(false)

  useEffect(() => {
    function sync() {
      setActive(!!getFullscreenElement())
    }

    sync()
    document.addEventListener("fullscreenchange", sync)
    document.addEventListener("webkitfullscreenchange", sync as EventListener)
    document.addEventListener("mozfullscreenchange", sync)

    return () => {
      document.removeEventListener("fullscreenchange", sync)
      document.removeEventListener("webkitfullscreenchange", sync as EventListener)
      document.removeEventListener("mozfullscreenchange", sync)
    }
  }, [])

  const toggle = useCallback(async () => {
    try {
      if (getFullscreenElement()) {
        await exitFullscreen()
      } else {
        await enterFullscreen()
      }
    } catch {
      /* unsupported or denied */
    }
  }, [])

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className="size-8 shrink-0"
      aria-label={active ? t("fullscreenExit") : t("fullscreenEnter")}
      aria-pressed={active}
      onClick={() => void toggle()}
    >
      <HugeiconsIcon
        icon={active ? MinimizeScreenIcon : FullscreenIcon}
        strokeWidth={2}
        aria-hidden="true"
        className="size-4"
      />
    </Button>
  )
}
