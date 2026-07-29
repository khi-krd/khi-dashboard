"use client"

import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import { AboutSectionCardShell } from "@/components/about/about-section-card-shell"
import { NS } from "@/components/about/about-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  useAboutPartnersQuery,
  useCreateAboutPartner,
  useDeleteAboutPartner,
  useUpdateAboutPartner,
} from "@/hooks/useAbout"
import { cn } from "@/lib/utils"
import type { AboutPartnerDto } from "@/types/about"

function clean(v?: string | null) {
  const t = v?.trim()
  return t ? t : null
}

export function AboutPartnersSectionCard({ index }: { index: number }) {
  const partnersQ = useAboutPartnersQuery()
  const createMut = useCreateAboutPartner()
  const updateMut = useUpdateAboutPartner()
  const deleteMut = useDeleteAboutPartner()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AboutPartnerDto | null>(null)
  const [form, setForm] = useState({
    nameCkb: "",
    nameKmr: "",
    descriptionCkb: "",
    descriptionKmr: "",
    logoUrl: "",
    websiteUrl: "",
    displayOrder: "0",
  })

  function openCreate() {
    setEditing(null)
    setForm({
      nameCkb: "",
      nameKmr: "",
      descriptionCkb: "",
      descriptionKmr: "",
      logoUrl: "",
      websiteUrl: "",
      displayOrder: String(partnersQ.data?.length ?? 0),
    })
    setDialogOpen(true)
  }

  function openEdit(item: AboutPartnerDto) {
    setEditing(item)
    setForm({
      nameCkb: item.nameCkb ?? "",
      nameKmr: item.nameKmr ?? "",
      descriptionCkb: item.descriptionCkb ?? "",
      descriptionKmr: item.descriptionKmr ?? "",
      logoUrl: item.logoUrl ?? "",
      websiteUrl: item.websiteUrl ?? "",
      displayOrder: String(item.displayOrder ?? 0),
    })
    setDialogOpen(true)
  }

  async function savePartner() {
    const payload = {
      nameCkb: clean(form.nameCkb),
      nameKmr: clean(form.nameKmr),
      descriptionCkb: clean(form.descriptionCkb),
      descriptionKmr: clean(form.descriptionKmr),
      logoUrl: clean(form.logoUrl),
      websiteUrl: clean(form.websiteUrl),
      displayOrder: Number(form.displayOrder || "0"),
      active: true,
    }
    try {
      if (editing?.id) {
        await updateMut.mutateAsync({ id: editing.id, payload })
      } else {
        await createMut.mutateAsync(payload)
      }
      toast.success(NS.toast.saved)
      setDialogOpen(false)
    } catch {
      toast.error(NS.error.validation)
    }
  }

  const items = partnersQ.data ?? []

  return (
    <>
      <AboutSectionCardShell
        index={index}
        titlePreview={NS.section.partners}
        hideSave
      >
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="outline" onClick={openCreate}>
            <PlusIcon className="me-1 size-4" />
            {NS.form.partner_add}
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{NS.form.partner_empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id ?? `${item.nameCkb}-${item.displayOrder}`}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  {item.logoUrl?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.logoUrl}
                      alt=""
                      className="border-border size-14 shrink-0 rounded-lg border bg-background object-contain p-1"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm">
                      {item.nameCkb || item.nameKmr || "—"}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {item.descriptionCkb ||
                        item.descriptionKmr ||
                        item.websiteUrl ||
                        "—"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(item)}
                  >
                    <PencilIcon className="me-1 size-3.5" />
                    {NS.action.edit}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => item.id && void deleteMut.mutateAsync(item.id)}
                  >
                    <TrashIcon className="me-1 size-3.5" />
                    {NS.action.delete}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </AboutSectionCardShell>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? NS.form.partner_edit : NS.form.partner_add}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pe-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-xs text-primary">{NS.form.section_ckb}</Label>
                <Input
                  placeholder={NS.form.name}
                  value={form.nameCkb}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nameCkb: e.target.value }))
                  }
                />
                <Textarea
                  rows={4}
                  placeholder={NS.form.description}
                  value={form.descriptionCkb}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, descriptionCkb: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <Label
                  className={cn(
                    "text-xs text-blue-700 dark:text-blue-400",
                  )}
                >
                  {NS.form.section_kmr}
                </Label>
                <Input
                  placeholder={NS.form.name}
                  value={form.nameKmr}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nameKmr: e.target.value }))
                  }
                />
                <Textarea
                  rows={4}
                  placeholder={NS.form.description}
                  value={form.descriptionKmr}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, descriptionKmr: e.target.value }))
                  }
                />
              </div>
            </div>
            <Separator />
            <MediaCoverUpload
              label={NS.form.partner_logo}
              previewUrl={form.logoUrl.trim() || null}
              urlValue={form.logoUrl}
              aspectClass="aspect-square max-w-xs"
              onUrlChange={(v) => setForm((p) => ({ ...p, logoUrl: v }))}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                dir="ltr"
                placeholder={NS.form.partner_website}
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm((p) => ({ ...p, websiteUrl: e.target.value }))
                }
              />
              <Input
                placeholder={NS.form.team_display_order}
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, displayOrder: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              disabled={createMut.isPending || updateMut.isPending}
              onClick={() => void savePartner()}
            >
              {NS.action.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
