import type { AboutFormValues } from "@/lib/validations/about"

function trimOrUndef(s: string | null | undefined) {
  const t = s?.trim()
  return t || undefined
}

function serializeBlocks(values: AboutFormValues) {
  return values.blocks.map((b, index) => ({
    id: typeof b.id === "number" ? b.id : undefined,
    type: b.type,
    sortOrder: index,
    contentLanguages: b.contentLanguages ?? values.contentLanguages,
    headingCkb: trimOrUndef(b.headingCkb),
    headingKmr: trimOrUndef(b.headingKmr),
    bodyCkb: b.bodyCkb ?? undefined,
    bodyKmr: b.bodyKmr ?? undefined,
    imageUrl: trimOrUndef(b.imageUrl),
    captionCkb: trimOrUndef(b.captionCkb),
    captionKmr: trimOrUndef(b.captionKmr),
    alignment: b.alignment ?? undefined,
    embedUrl: trimOrUndef(b.embedUrl),
    audioUrl: trimOrUndef(b.audioUrl),
    titleCkb: trimOrUndef(b.titleCkb),
    titleKmr: trimOrUndef(b.titleKmr),
    durationSeconds: b.durationSeconds ?? undefined,
    images: (b.images ?? []).map((img, i) => ({
      id: img.id,
      imageUrl: trimOrUndef(img.imageUrl),
      sortOrder: img.sortOrder ?? i,
    })),
    textCkb: trimOrUndef(b.textCkb),
    textKmr: trimOrUndef(b.textKmr),
    attributionCkb: trimOrUndef(b.attributionCkb),
    attributionKmr: trimOrUndef(b.attributionKmr),
    value: trimOrUndef(b.value),
    unitCkb: trimOrUndef(b.unitCkb),
    unitKmr: trimOrUndef(b.unitKmr),
    labelCkb: trimOrUndef(b.labelCkb),
    labelKmr: trimOrUndef(b.labelKmr),
  }))
}

export function aboutFormValuesToMultipart(
  mode: "create" | "edit",
  aboutId: number | undefined,
  values: AboutFormValues,
): FormData {
  const fd = new FormData()

  const payload: Record<string, unknown> = {
    ...(mode === "edit" && typeof aboutId === "number" ? { id: aboutId } : {}),
    status: values.status,
    slugCkb: values.slugCkb.trim(),
    slugKmr: trimOrUndef(values.slugKmr) ?? null,
    titleCkb: trimOrUndef(values.titleCkb),
    titleKmr: trimOrUndef(values.titleKmr),
    subtitleCkb: trimOrUndef(values.subtitleCkb),
    subtitleKmr: trimOrUndef(values.subtitleKmr),
    seoDescriptionCkb: trimOrUndef(values.seoDescriptionCkb),
    seoDescriptionKmr: trimOrUndef(values.seoDescriptionKmr),
    heroImageUrl: values.heroImageFile
      ? null
      : trimOrUndef(values.heroImageUrl) ?? trimOrUndef(values.existingHeroImageUrl),
    contentLanguages: values.contentLanguages,
    blocks: serializeBlocks(values),
  }

  fd.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  )

  if (values.heroImageFile) {
    fd.append("heroImage", values.heroImageFile)
  }

  values.blocks.forEach((block, blockIndex) => {
    if (block.imageFile) {
      fd.append(`blockImages[${blockIndex}]`, block.imageFile)
    }
    ;(block.images ?? []).forEach((img, imgIndex) => {
      if (img.imageFile) {
        fd.append(
          `blockGalleryImages[${blockIndex}][${imgIndex}]`,
          img.imageFile,
        )
      }
    })
  })

  return fd
}
