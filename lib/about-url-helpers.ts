export function aboutSiteBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  return base.replace(/\/$/, "")
}

export function publicSiteLabel(): string {
  const label = process.env.NEXT_PUBLIC_SITE_LABEL?.trim()
  if (label) return label

  const base = aboutSiteBaseUrl()
  if (!base) return ""

  try {
    return new URL(base).hostname.replace(/^www\./, "")
  } catch {
    return base.replace(/^https?:\/\//, "").replace(/\/$/, "")
  }
}

export function aboutPublicUrl(slug: string): string {
  const base = aboutSiteBaseUrl()
  if (!base) return `/about/${slug}`
  return `${base}/about/${slug}`
}

export function copyAboutPublicUrl(slug: string): string {
  return aboutPublicUrl(slug)
}
