"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"

/** Animated icon crossfade (ReUI c-button-43 pattern), wired to color scheme toggle. */
export function ThemeToggleButton() {
  const t = useTranslations("Sidebar.a11y")
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const dark = mounted && resolvedTheme === "dark"

  return (
    <Button
      size="icon"
      variant="outline"
      className="size-8 shrink-0"
      aria-label={dark ? t("themeSwitchToLight") : t("themeSwitchToDark")}
      aria-pressed={dark}
      disabled={!mounted}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <span className="relative flex size-4 items-center justify-center">
        <HugeiconsIcon
          icon={Sun03Icon}
          strokeWidth={2}
          aria-hidden="true"
          className={cn(
            "absolute size-4 transition-all duration-200",
            dark
              ? "scale-75 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100",
          )}
        />
        <HugeiconsIcon
          icon={Moon02Icon}
          strokeWidth={2}
          aria-hidden="true"
          className={cn(
            "absolute size-4 transition-all duration-200",
            dark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-75 -rotate-90 opacity-0",
          )}
        />
      </span>
    </Button>
  )
}
