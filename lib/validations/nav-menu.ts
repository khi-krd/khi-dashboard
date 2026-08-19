import { z } from "zod"

import type { NavMenuItemDto } from "@/types/nav-menu"

// Every field is optional by design: an editor can save with any subset filled
// in. Format/length rules fire on what was typed, never on what was left blank.
/** Caps mirror the column widths in §2 so the client rejects before the API does. */
export const navMenuLinkSchema = z.object({
  labelCkb: z.string().trim().max(200),
  labelKmr: z.string().max(200).optional().nullable(),
  href: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), {
      message: "href_relative",
    }),
  active: z.boolean().default(true),
})

export const navMenuItemSchema = z.object({
  itemKey: z
    .string()
    .trim()
    .max(60)
    // Lower-cased on save by the server; the same rule is applied client-side so
    // what the editor typed matches what comes back.
    .refine((v) => v === "" || /^[a-z0-9][a-z0-9-]*$/i.test(v), {
      message: "item_key_format",
    }),
  labelCkb: z.string().trim().max(200),
  labelKmr: z.string().max(200).optional().nullable(),
  descriptionCkb: z.string().optional().nullable(),
  descriptionKmr: z.string().optional().nullable(),
  href: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || v.startsWith("/"), { message: "href_relative" }),
  imageUrl: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  links: z.array(navMenuLinkSchema).default([]),
})

export type NavMenuLinkFormValues = z.infer<typeof navMenuLinkSchema>
export type NavMenuItemFormValues = z.infer<typeof navMenuItemSchema>

export function defaultNavMenuLinkValues(): NavMenuLinkFormValues {
  return { labelCkb: "", labelKmr: "", href: "", active: true }
}

export function defaultNavMenuItemValues(
  displayOrder = 0,
): NavMenuItemFormValues {
  return {
    itemKey: "",
    labelCkb: "",
    labelKmr: "",
    descriptionCkb: "",
    descriptionKmr: "",
    href: "",
    imageUrl: "",
    displayOrder,
    active: true,
    links: [],
  }
}

/**
 * Optional fields come back absent rather than null (§3.2), so each one is
 * coalesced to `""` — binding `undefined` to an input makes it uncontrolled.
 */
export function navMenuItemDtoToFormValues(
  dto: NavMenuItemDto,
): NavMenuItemFormValues {
  return {
    itemKey: dto.itemKey ?? "",
    labelCkb: dto.labelCkb ?? "",
    labelKmr: dto.labelKmr ?? "",
    descriptionCkb: dto.descriptionCkb ?? "",
    descriptionKmr: dto.descriptionKmr ?? "",
    href: dto.href ?? "",
    imageUrl: dto.imageUrl ?? "",
    displayOrder: dto.displayOrder ?? 0,
    active: dto.active,
    links: (dto.links ?? []).map((l) => ({
      labelCkb: l.labelCkb ?? "",
      labelKmr: l.labelKmr ?? "",
      href: l.href ?? "",
      active: l.active,
    })),
  }
}
