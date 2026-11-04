"use client"

import { useMemo, useState } from "react"
import {
  CheckIcon,
  ChevronUpDownIcon,
  MapPinIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

import { LOCATION_NS as NS } from "@/components/shared/location-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  useCreateLocationMutation,
  useDeleteLocationMutation,
  useLocationsQuery,
  useUpdateLocationMutation,
} from "@/hooks/useTaxonomy"
import { toastApiError, toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { LocationDto } from "@/types/taxonomy"

export type LocationLang = "CKB" | "KMR"

/** The option's label in the language the field belongs to. */
function nameFor(loc: LocationDto, lang: LocationLang): string {
  return (lang === "KMR" ? loc.nameKmr.trim() : "") || loc.nameCkb.trim()
}

function otherName(loc: LocationDto, lang: LocationLang): string {
  const other = lang === "KMR" ? loc.nameCkb.trim() : loc.nameKmr.trim()
  return other && other !== nameFor(loc, lang) ? other : ""
}

const iconBtn =
  "text-muted-foreground hover:text-foreground hover:bg-muted inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"

function NameFields({
  ckb,
  kmr,
  onCkb,
  onKmr,
  onSubmit,
}: {
  ckb: string
  kmr: string
  onCkb: (v: string) => void
  onKmr: (v: string) => void
  onSubmit: () => void
}) {
  const submitOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSubmit()
    }
  }
  return (
    <div className="space-y-1.5">
      <Input
        autoFocus
        dir="rtl"
        className="h-8"
        placeholder={NS.nameCkb}
        value={ckb}
        onChange={(e) => onCkb(e.target.value)}
        onKeyDown={submitOnEnter}
      />
      <Input
        dir="ltr"
        lang="ku"
        className="h-8"
        placeholder={NS.nameKmr}
        value={kmr}
        onChange={(e) => onKmr(e.target.value)}
        onKeyDown={submitOnEnter}
      />
    </div>
  )
}

function LocationRow({
  loc,
  lang,
  checked,
  onPick,
  onRenamed,
}: {
  loc: LocationDto
  lang: LocationLang
  checked: boolean
  onPick: (name: string) => void
  onRenamed: (oldName: string, newName: string) => void
}) {
  const updateMut = useUpdateLocationMutation()
  const deleteMut = useDeleteLocationMutation()
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view")
  const [ckb, setCkb] = useState(loc.nameCkb)
  const [kmr, setKmr] = useState(loc.nameKmr)
  const label = nameFor(loc, lang)

  const save = () => {
    const nameCkb = ckb.trim()
    if (!nameCkb) {
      toastError(NS.toast.nameRequired)
      return
    }
    updateMut.mutate(
      { id: loc.id, payload: { nameCkb, nameKmr: kmr.trim() } },
      {
        onSuccess: (updated) => {
          const next = nameFor(updated, lang)
          if (checked && next !== label) onRenamed(label, next)
          toastSuccess(NS.toast.updated)
          setMode("view")
        },
        onError: (err) => toastApiError(err),
      },
    )
  }

  if (mode === "edit") {
    return (
      <div className="bg-muted/50 space-y-2 rounded-md p-2">
        <NameFields
          ckb={ckb}
          kmr={kmr}
          onCkb={setCkb}
          onKmr={setKmr}
          onSubmit={save}
        />
        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            className="flex-1"
            disabled={updateMut.isPending}
            onClick={save}
          >
            {NS.save}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setCkb(loc.nameCkb)
              setKmr(loc.nameKmr)
              setMode("view")
            }}
          >
            {NS.cancel}
          </Button>
        </div>
      </div>
    )
  }

  if (mode === "delete") {
    return (
      <div className="border-destructive/30 bg-destructive/5 space-y-2 rounded-md border p-2">
        <p className="text-sm">{NS.confirmDelete(label)}</p>
        <p className="text-muted-foreground text-xs">{NS.deleteHint}</p>
        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="flex-1"
            disabled={deleteMut.isPending}
            onClick={() =>
              deleteMut.mutate(loc.id, {
                onSuccess: () => toastSuccess(NS.toast.deleted),
                onError: (err) => {
                  toastApiError(err)
                  setMode("view")
                },
              })
            }
          >
            {NS.delete}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMode("view")}
          >
            {NS.cancel}
          </Button>
        </div>
      </div>
    )
  }

  const sub = otherName(loc, lang)
  return (
    <div
      className={cn(
        "group hover:bg-muted flex items-center gap-1 rounded-md pe-1",
        checked && "bg-muted",
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-2 px-2 py-1.5 text-start text-sm"
        onClick={() => onPick(label)}
      >
        <CheckIcon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            checked ? "text-primary opacity-100" : "opacity-0",
          )}
        />
        <span className="min-w-0">
          <span className="block truncate" dir="auto">
            {label}
          </span>
          {sub ? (
            <span
              className="text-muted-foreground block truncate text-xs"
              dir="auto"
            >
              {sub}
            </span>
          ) : null}
        </span>
      </button>
      <button
        type="button"
        className={iconBtn}
        aria-label={NS.edit}
        title={NS.edit}
        onClick={() => setMode("edit")}
      >
        <PencilSquareIcon className="size-4" />
      </button>
      <button
        type="button"
        className={cn(iconBtn, "hover:text-destructive")}
        aria-label={NS.delete}
        title={NS.delete}
        onClick={() => setMode("delete")}
      >
        <TrashIcon className="size-4" />
      </button>
    </div>
  )
}

/**
 * Searchable list of the managed locations with inline add / edit / delete.
 * Typing a name that is not in the list can still be used as-is, so records
 * carrying an older free-text location stay editable.
 */
function LocationOptionsPanel({
  lang,
  selected,
  onPick,
  onRenamed,
}: {
  lang: LocationLang
  selected: string[]
  onPick: (name: string) => void
  onRenamed: (oldName: string, newName: string) => void
}) {
  const locationsQ = useLocationsQuery()
  const createMut = useCreateLocationMutation()
  const [query, setQuery] = useState("")
  const [adding, setAdding] = useState(false)
  const [draftCkb, setDraftCkb] = useState("")
  const [draftKmr, setDraftKmr] = useState("")

  const all = useMemo(() => locationsQ.data ?? [], [locationsQ.data])
  const q = query.trim().toLowerCase()
  const items = useMemo(
    () =>
      q
        ? all.filter(
            (l) =>
              l.nameCkb.toLowerCase().includes(q) ||
              l.nameKmr.toLowerCase().includes(q),
          )
        : all,
    [all, q],
  )
  const typed = query.trim()
  const typedIsKnown = all.some(
    (l) => nameFor(l, lang) === typed || l.nameCkb === typed,
  )

  const startAdd = () => {
    setAdding(true)
    if (typed && !typedIsKnown) {
      if (lang === "KMR") setDraftKmr(typed)
      else setDraftCkb(typed)
    }
  }

  const create = () => {
    const nameCkb = draftCkb.trim()
    if (!nameCkb) {
      toastError(NS.toast.nameRequired)
      return
    }
    createMut.mutate(
      { nameCkb, nameKmr: draftKmr.trim() },
      {
        onSuccess: (created) => {
          toastSuccess(NS.toast.created)
          onPick(nameFor(created, lang))
          setDraftCkb("")
          setDraftKmr("")
          setQuery("")
          setAdding(false)
        },
        onError: (err) => toastApiError(err),
      },
    )
  }

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={NS.search}
        className="h-9"
        dir="auto"
        onKeyDown={(e) => {
          if (e.key === "Enter" && typed) {
            e.preventDefault()
            const match = items[0]
            onPick(match && items.length === 1 ? nameFor(match, lang) : typed)
            setQuery("")
          }
        }}
      />

      <div className="max-h-64 space-y-0.5 overflow-y-auto">
        {locationsQ.isLoading ? (
          <p className="text-muted-foreground px-2 py-1.5 text-xs">
            {NS.loading}
          </p>
        ) : null}
        {!locationsQ.isLoading && items.length === 0 && !typed ? (
          <p className="text-muted-foreground px-2 py-1.5 text-xs">{NS.empty}</p>
        ) : null}
        {items.map((loc) => (
          <LocationRow
            key={`${loc.id}:${loc.nameCkb}:${loc.nameKmr}`}
            loc={loc}
            lang={lang}
            checked={selected.includes(nameFor(loc, lang))}
            onPick={onPick}
            onRenamed={onRenamed}
          />
        ))}
        {typed && !typedIsKnown ? (
          <button
            type="button"
            className="hover:bg-muted flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm"
            onClick={() => {
              onPick(typed)
              setQuery("")
            }}
          >
            <MapPinIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{NS.typedOption(typed)}</span>
          </button>
        ) : null}
      </div>

      {adding ? (
        <div className="border-border space-y-2 border-t pt-2">
          <NameFields
            ckb={draftCkb}
            kmr={draftKmr}
            onCkb={setDraftCkb}
            onKmr={setDraftKmr}
            onSubmit={create}
          />
          <div className="flex gap-1.5">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              disabled={createMut.isPending}
              onClick={create}
            >
              {NS.save}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              {NS.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary w-full justify-start gap-1.5"
          onClick={startAdd}
        >
          <PlusIcon className="size-4" />
          {NS.add}
        </Button>
      )}
    </div>
  )
}

type Variant = "field" | "inline"

const triggerVariant: Record<Variant, string> = {
  field:
    "border-input hover:bg-muted/40 h-10 rounded-md border bg-transparent px-3 shadow-xs",
  inline: "hover:bg-muted/40 h-9 rounded-md px-1",
}

/** Single location — used by every content form with one location field. */
export function LocationSelect({
  value,
  onChange,
  lang = "CKB",
  placeholder = NS.placeholder,
  variant = "field",
  id,
  className,
}: {
  value: string | null | undefined
  onChange: (value: string) => void
  lang?: LocationLang
  placeholder?: string
  variant?: Variant
  id?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const current = (value ?? "").trim()

  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              id={id}
              type="button"
              className={cn(
                "flex min-w-0 flex-1 items-center justify-between gap-2 text-start text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                triggerVariant[variant],
              )}
            >
              {current ? (
                <span className="truncate" dir="auto">
                  {current}
                </span>
              ) : (
                <span className="text-muted-foreground/70 truncate">
                  {placeholder}
                </span>
              )}
              <ChevronUpDownIcon className="size-4 shrink-0 opacity-50" />
            </button>
          }
        />
        <PopoverContent
          dir="rtl"
          align="start"
          className="w-[max(var(--anchor-width),18rem)] p-2"
        >
          <LocationOptionsPanel
            lang={lang}
            selected={current ? [current] : []}
            onPick={(name) => {
              onChange(name)
              setOpen(false)
            }}
            onRenamed={(_, next) => onChange(next)}
          />
        </PopoverContent>
      </Popover>
      {current ? (
        <button
          type="button"
          className={iconBtn}
          aria-label={NS.clear}
          title={NS.clear}
          onClick={() => onChange("")}
        >
          <XMarkIcon className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

/** Several locations as chips — sound tracks carry a list per language. */
export function LocationMultiSelect({
  values,
  onChange,
  lang = "CKB",
  placeholder = NS.addMore,
}: {
  values: string[]
  onChange: (values: string[]) => void
  lang?: LocationLang
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const toggle = (name: string) =>
    onChange(
      values.includes(name)
        ? values.filter((v) => v !== name)
        : [...values, name],
    )

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
        >
          <span dir="auto">{v}</span>
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            aria-label={NS.remove}
          >
            <XMarkIcon className="size-3.5" />
          </button>
        </span>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border inline-flex h-8 items-center gap-1 rounded-md border border-dashed px-2.5 text-xs transition-colors"
            >
              <PlusIcon className="size-3.5" />
              {placeholder}
            </button>
          }
        />
        <PopoverContent dir="rtl" align="start" className="w-72 p-2">
          <LocationOptionsPanel
            lang={lang}
            selected={values}
            onPick={toggle}
            onRenamed={(prev, next) =>
              onChange(values.map((v) => (v === prev ? next : v)))
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
