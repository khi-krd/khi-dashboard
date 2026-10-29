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
import {
  MediaLightbox,
  useLightbox,
} from "@/components/shared/media-lightbox"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  useAboutTeamMembersQuery,
  useCreateAboutTeamMember,
  useDeleteAboutTeamMember,
  useUpdateAboutTeamMember,
} from "@/hooks/useAbout"
import { cn } from "@/lib/utils"
import { toastApiError } from "@/lib/toast"
import type { AboutTeamMemberDto } from "@/types/about"

function clean(v?: string | null) {
  const t = v?.trim()
  return t ? t : null
}

type OfficeId = "sulaymaniyah" | "duhok"

const OFFICE_API_VALUES: Record<OfficeId, string> = {
  sulaymaniyah: "SULAYMANIYAH",
  duhok: "DUHOK",
}

const OFFICE_ALIASES: Record<string, OfficeId> = {
  SULAYMANIYAH: "sulaymaniyah",
  SULAYMANIYA: "sulaymaniyah",
  ERBIL: "sulaymaniyah",
  DUHOK: "duhok",
}

function officeId(raw?: string | null): OfficeId {
  const key = (raw ?? "").trim().toUpperCase().replace(/[\s-]/g, "_")
  return OFFICE_ALIASES[key] ?? "sulaymaniyah"
}

const emptyForm = {
  nameCkb: "",
  nameKmr: "",
  roleCkb: "",
  roleKmr: "",
  bioCkb: "",
  bioKmr: "",
  office: "SULAYMANIYAH",
  memberType: "MEMBER",
  imageUrl: "",
  displayOrder: "0",
}

function MemberCard({
  item,
  officeLabel,
  onEdit,
  onDelete,
  onImageClick,
}: {
  item: AboutTeamMemberDto
  officeLabel: string
  onEdit: () => void
  onDelete: () => void
  onImageClick: () => void
}) {
  const isManager = item.memberType === "MANAGER"
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-4">
        {item.imageUrl?.trim() ? (
          <button
            type="button"
            onClick={onImageClick}
            className="cursor-zoom-in shrink-0 self-start"
            aria-label={item.nameCkb || item.nameKmr || undefined}
          >
            <Image
              src={item.imageUrl}
              alt=""
              width={112}
              height={112}
              className="border-border size-28 rounded-xl border object-cover shadow-sm"
              unoptimized={!isOptimizableImageSrc(item.imageUrl)}
            />
          </button>
        ) : (
          <div className="border-border bg-muted text-muted-foreground grid size-28 shrink-0 place-items-center rounded-xl border text-xs">
            {NS.form.team_image}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <CardTitle className="text-base leading-snug">
            {item.nameCkb || item.nameKmr || "—"}
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            {item.roleCkb || item.roleKmr || "—"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]">
              {officeLabel}
            </span>
            {isManager ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-medium">
                {NS.form.team_type_manager}
              </span>
            ) : null}
          </div>
          <div className="mt-auto flex gap-2 pt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEdit}
            >
              <PencilIcon className="me-1 size-3.5" />
              {NS.action.edit}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={onDelete}
            >
              <TrashIcon className="me-1 size-3.5" />
              {NS.action.delete}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function AboutTeamSectionCard({ index }: { index: number }) {
  const teamQ = useAboutTeamMembersQuery()
  const createMut = useCreateAboutTeamMember()
  const updateMut = useUpdateAboutTeamMember()
  const deleteMut = useDeleteAboutTeamMember()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AboutTeamMemberDto | null>(null)
  const [form, setForm] = useState(emptyForm)

  function openCreate() {
    setEditing(null)
    setForm({
      ...emptyForm,
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
      office: OFFICE_API_VALUES[officeId(item.office)],
      memberType: item.memberType === "MANAGER" ? "MANAGER" : "MEMBER",
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
      memberType: form.memberType === "MANAGER" ? "MANAGER" : "MEMBER",
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
    } catch (err) {
      toastApiError(err, NS.error.validation)
    }
  }

  const items = teamQ.data ?? []
  const managers = items.filter((i) => i.memberType === "MANAGER")
  const officeGroups = (["sulaymaniyah", "duhok"] as const).map((id) => ({
    id,
    label:
      id === "sulaymaniyah"
        ? NS.form.team_group_sulaymaniyah
        : NS.form.team_group_duhok,
    items: items.filter(
      (i) => i.memberType !== "MANAGER" && officeId(i.office) === id,
    ),
  }))

  // Lightbox order mirrors the render order (managers, then each office
  // group) so opening a photo lands on the image the user tapped.
  const lb = useLightbox()
  const imageItems = [managers, ...officeGroups.map((g) => g.items)]
    .flat()
    .filter((i) => i.imageUrl?.trim())
    .map((i) => ({
      src: i.imageUrl as string,
      alt: i.nameCkb || i.nameKmr,
      caption: i.roleCkb || i.roleKmr,
    }))
  const imageIndex = (item: AboutTeamMemberDto) =>
    imageItems.findIndex((i) => i.src === item.imageUrl)

  const deleteItem = (item: AboutTeamMemberDto) => {
    if (!item.id) return
    deleteMut.mutate(item.id, {
      onSuccess: () => toast.success(NS.toast.deleted),
      onError: (err) => toastApiError(err, NS.error.deleteFailed),
    })
  }

  const renderGroup = (
    heading: string,
    list: AboutTeamMemberDto[],
  ) =>
    list.length > 0 ? (
      <div className="space-y-3">
        <h3 className="text-muted-foreground border-border border-b pb-1.5 text-xs font-semibold uppercase">
          {heading}
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {list.map((item) => (
            <MemberCard
              key={item.id ?? `${item.nameCkb}-${item.displayOrder}`}
              item={item}
              officeLabel={
                officeId(item.office) === "sulaymaniyah"
                  ? NS.form.team_office_sulaymaniyah
                  : NS.form.team_office_duhok
              }
              onEdit={() => openEdit(item)}
              onDelete={() => deleteItem(item)}
              onImageClick={() => {
                const i = imageIndex(item)
                if (i >= 0) lb.openAt(i)
              }}
            />
          ))}
        </div>
      </div>
    ) : null

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
          <div className="space-y-6">
            {renderGroup(NS.form.team_managers_group, managers)}
            {officeGroups.map((g) => renderGroup(g.label, g.items))}
          </div>
        )}
      </AboutSectionCardShell>

      <MediaLightbox
        open={lb.open}
        onOpenChange={lb.onOpenChange}
        items={imageItems}
        initialIndex={lb.index}
      />

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
            <MediaCoverUpload entity="about" compressOptions
              label={NS.form.team_image}
              previewUrl={form.imageUrl.trim() || null}
              urlValue={form.imageUrl}
              aspectClass="aspect-square max-w-xs"
              onUrlChange={(v) => setForm((p) => ({ ...p, imageUrl: v }))}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {NS.form.team_office}
                </Label>
                <Select
                  value={form.office}
                  onValueChange={(v) =>
                    v && setForm((p) => ({ ...p, office: v }))
                  }
                >
                  <SelectTrigger className="w-full" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="SULAYMANIYAH">
                      {NS.form.team_office_sulaymaniyah}
                    </SelectItem>
                    <SelectItem value="DUHOK">
                      {NS.form.team_office_duhok}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {NS.form.team_member_type}
                </Label>
                <Select
                  value={form.memberType}
                  onValueChange={(v) =>
                    v && setForm((p) => ({ ...p, memberType: v }))
                  }
                >
                  <SelectTrigger className="w-full" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="MANAGER">
                      {NS.form.team_type_manager}
                    </SelectItem>
                    <SelectItem value="MEMBER">
                      {NS.form.team_type_member}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {NS.form.team_display_order}
                </Label>
                <Input
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, displayOrder: e.target.value }))
                  }
                />
              </div>
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
