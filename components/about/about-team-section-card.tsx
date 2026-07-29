"use client"

import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { toast } from "sonner"

import Image from "next/image"
import { isOptimizableImageSrc } from "@/lib/image-src"
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
  useAboutTeamMembersQuery,
  useCreateAboutTeamMember,
  useDeleteAboutTeamMember,
  useUpdateAboutTeamMember,
} from "@/hooks/useAbout"
import { cn } from "@/lib/utils"
import type { AboutTeamMemberDto } from "@/types/about"

function clean(v?: string | null) {
  const t = v?.trim()
  return t ? t : null
}

export function AboutTeamSectionCard({ index }: { index: number }) {
  const teamQ = useAboutTeamMembersQuery()
  const createMut = useCreateAboutTeamMember()
  const updateMut = useUpdateAboutTeamMember()
  const deleteMut = useDeleteAboutTeamMember()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AboutTeamMemberDto | null>(null)
  const [form, setForm] = useState({
    nameCkb: "",
    nameKmr: "",
    roleCkb: "",
    roleKmr: "",
    bioCkb: "",
    bioKmr: "",
    office: "",
    imageUrl: "",
    displayOrder: "0",
  })

  function openCreate() {
    setEditing(null)
    setForm({
      nameCkb: "",
      nameKmr: "",
      roleCkb: "",
      roleKmr: "",
      bioCkb: "",
      bioKmr: "",
      office: "",
      imageUrl: "",
      displayOrder: String(teamQ.data?.length ?? 0),
    })
    setDialogOpen(true)
  }

  function openEdit(item: AboutTeamMemberDto) {
    setEditing(item)
    setForm({
      nameCkb: item.nameCkb ?? "",
      nameKmr: item.nameKmr ?? "",
      roleCkb: item.roleCkb ?? "",
      roleKmr: item.roleKmr ?? "",
      bioCkb: item.bioCkb ?? "",
      bioKmr: item.bioKmr ?? "",
      office: item.office ?? "",
      imageUrl: item.imageUrl ?? "",
      displayOrder: String(item.displayOrder ?? 0),
    })
    setDialogOpen(true)
  }

  async function saveMember() {
    const payload = {
      nameCkb: clean(form.nameCkb),
      nameKmr: clean(form.nameKmr),
      roleCkb: clean(form.roleCkb),
      roleKmr: clean(form.roleKmr),
      bioCkb: clean(form.bioCkb),
      bioKmr: clean(form.bioKmr),
      office: clean(form.office),
      imageUrl: clean(form.imageUrl),
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

  const items = teamQ.data ?? []

  return (
    <>
      <AboutSectionCardShell
        index={index}
        titlePreview={NS.section.team}
        hideSave
      >
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="outline" onClick={openCreate}>
            <PlusIcon className="me-1 size-4" />
            {NS.form.team_add}
          </Button>
        </div>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{NS.form.team_empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id ?? `${item.nameCkb}-${item.displayOrder}`}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  {item.imageUrl?.trim() ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="border-border size-14 shrink-0 rounded-lg border object-cover"
                      unoptimized={!isOptimizableImageSrc(item.imageUrl)}
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm">
                      {item.nameCkb || item.nameKmr || "—"}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.roleCkb || item.roleKmr || "—"}
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
              {editing ? NS.form.team_edit : NS.form.team_add}
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
                <Input
                  placeholder={NS.form.role}
                  value={form.roleCkb}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, roleCkb: e.target.value }))
                  }
                />
                <Textarea
                  rows={3}
                  placeholder={NS.form.bio}
                  value={form.bioCkb}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bioCkb: e.target.value }))
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
                <Input
                  placeholder={NS.form.role}
                  value={form.roleKmr}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, roleKmr: e.target.value }))
                  }
                />
                <Textarea
                  rows={3}
                  placeholder={NS.form.bio}
                  value={form.bioKmr}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bioKmr: e.target.value }))
                  }
                />
              </div>
            </div>
            <Separator />
            <MediaCoverUpload
              label={NS.form.team_image}
              previewUrl={form.imageUrl.trim() || null}
              urlValue={form.imageUrl}
              aspectClass="aspect-square max-w-xs"
              onUrlChange={(v) => setForm((p) => ({ ...p, imageUrl: v }))}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                placeholder={NS.form.team_office}
                value={form.office}
                onChange={(e) =>
                  setForm((p) => ({ ...p, office: e.target.value }))
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
              onClick={() => void saveMember()}
            >
              {NS.action.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
