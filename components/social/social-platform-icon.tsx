"use client"

import {
  FacebookIcon,
  InstagramIcon,
  Link01Icon,
  LinkedinIcon,
  NewTwitterIcon,
  PinterestIcon,
  SnapchatIcon,
  SoundcloudIcon,
  SpotifyIcon,
  TelegramIcon,
  ThreadsIcon,
  TiktokIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"

type IconSpec = Parameters<typeof HugeiconsIcon>[0]["icon"]

const PLATFORM_ICONS: Record<string, IconSpec> = {
  FACEBOOK: FacebookIcon,
  INSTAGRAM: InstagramIcon,
  YOUTUBE: YoutubeIcon,
  WHATSAPP: WhatsappIcon,
  TIKTOK: TiktokIcon,
  TELEGRAM: TelegramIcon,
  TWITTER: NewTwitterIcon,
  LINKEDIN: LinkedinIcon,
  SNAPCHAT: SnapchatIcon,
  THREADS: ThreadsIcon,
  PINTEREST: PinterestIcon,
  SOUNDCLOUD: SoundcloudIcon,
  SPOTIFY: SpotifyIcon,
}

/**
 * Falls back to a generic link glyph rather than rendering nothing: a platform
 * the dashboard has no icon for is still a valid row (§7 rule 2), and a blank
 * square would read as a broken card.
 */
export function SocialPlatformIcon({
  platform,
  className,
}: {
  platform: string
  className?: string
}) {
  const icon = PLATFORM_ICONS[platform.trim().toUpperCase()] ?? Link01Icon
  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={2}
      className={cn("size-4", className)}
      aria-hidden
    />
  )
}
