import type { NavMenuItemFormValues } from "@/lib/validations/nav-menu"

function trimOrNull(s: string | null | undefined): string | null {
  const t = s?.trim()
  return t ? t : null
}

export type NavMenuLinkWritePayload = {
  labelCkb: string
  labelKmr: string | null
  href: string
  displayOrder: number
  active: boolean
}

export type NavMenuWritePayload = {
  itemKey: string
  labelCkb: string
  labelKmr: string | null
  descriptionCkb: string | null
  descriptionKmr: string | null
  href: string
  imageUrl: string | null
  displayOrder: number
  active: boolean
  links: NavMenuLinkWritePayload[]
}

/**
 * Builds the request body explicitly rather than posting the form object — this
 * is where trimming and the blank-to-`null` conversion happen (§3.1).
 *
 * Link ids are deliberately never sent: the server drops the old rows and
 * reinserts the array as given, so `displayOrder` is renumbered from the array
 * position and every save mints fresh ids.
 *
 * Half-filled link rows are dropped instead of failing validation — the editor
 * adds an empty row on "add link", and leaving one blank should mean "never
 * mind", not a blocked save.
 */
export function navMenuFormValuesToPayload(
  values: NavMenuItemFormValues,
): NavMenuWritePayload {
  return {
    itemKey: values.itemKey.trim().toLowerCase(),
    labelCkb: values.labelCkb.trim(),
    labelKmr: trimOrNull(values.labelKmr),
    descriptionCkb: trimOrNull(values.descriptionCkb),
    descriptionKmr: trimOrNull(values.descriptionKmr),
    href: values.href.trim(),
    imageUrl: trimOrNull(values.imageUrl),
    displayOrder: Number.isFinite(values.displayOrder)
      ? Number(values.displayOrder)
      : 0,
    active: values.active !== false,
    links: values.links
      .filter((l) => l.labelCkb.trim() && l.href.trim())
      .map((l, i) => ({
        labelCkb: l.labelCkb.trim(),
        labelKmr: trimOrNull(l.labelKmr),
        href: l.href.trim(),
        displayOrder: i + 1,
        active: l.active !== false,
      })),
  }
}
