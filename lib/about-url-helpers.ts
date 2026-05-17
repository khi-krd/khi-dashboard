export function aboutSiteBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  return base.replace(/\/$/, "")
}

export function aboutPublicUrl(slug: string): string {
  const base = aboutSiteBaseUrl()
  if (!base) return `/about/${slug}`
  return `${base}/about/${slug}`
}

export function copyAboutPublicUrl(slug: string): string {
  return aboutPublicUrl(slug)
}
