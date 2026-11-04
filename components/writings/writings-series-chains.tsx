"use client"

import {
  EyeIcon,
  PencilSquareIcon,
  RectangleStackIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"

import { WritingCoverThumb } from "@/components/writings/writing-cover-thumb"
import { WritingListLangChips } from "@/components/writings/writing-language-chip"
import { NS } from "@/components/writings/writings-strings"
import { Button } from "@/components/ui/button"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { WritingAdminTableRow } from "@/types/writings-ui"

export type SeriesChain = {
  key: string
  seriesId: string | null
  root: WritingAdminTableRow | null
  children: WritingAdminTableRow[]
  members: WritingAdminTableRow[]
  latest: number
}

function VolumePill({ order }: { order?: number | null }) {
  if (order == null || order <= 0) return null
  return (
    <span className="border-border bg-muted/60 text-muted-foreground inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] tabular-nums">
      {formatCkbDigits(order)}
    </span>
  )
}

function RowActions({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: WritingAdminTableRow
  onView: (row: WritingAdminTableRow) => void
  onEdit: (row: WritingAdminTableRow) => void
  onDelete: (row: WritingAdminTableRow) => void
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover/chainrow:opacity-100"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground size-8"
        title={NS.action.view}
        onClick={() => onView(row)}
      >
        <EyeIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground size-8"
        title={NS.action.edit}
        onClick={() => onEdit(row)}
      >
        <PencilSquareIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8"
        title={NS.action.delete}
        onClick={() => onDelete(row)}
      >
        <TrashIcon className="size-4" />
      </Button>
    </div>
  )
}

function ChainRowBody({
  row,
  titleClass,
}: {
  row: WritingAdminTableRow
  titleClass?: string
}) {
  const writer = row.writerCkb?.trim() || row.writerKmr?.trim()
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
      <span className={cn("text-foreground line-clamp-1 font-medium", titleClass)}>
        {row.titleCkb || row.titleKmr || NS.dash}
      </span>
      {row.titleKmr?.trim() && row.titleCkb?.trim() ? (
        <span className="text-muted-foreground line-clamp-1 text-xs">
          {row.titleKmr}
        </span>
      ) : null}
      <span className="text-muted-foreground line-clamp-1 text-xs">
        {writer || NS.dash}
      </span>
    </div>
  )
}

function SeriesChainBlock({
  chain,
  onView,
  onEdit,
  onDelete,
}: {
  chain: SeriesChain
  onView: (row: WritingAdminTableRow) => void
  onEdit: (row: WritingAdminTableRow) => void
  onDelete: (row: WritingAdminTableRow) => void
}) {
  const { root, children } = chain
  const seriesName =
    root?.seriesName?.trim() ||
    children[0]?.seriesName?.trim() ||
    root?.titleCkb ||
    NS.dash
  const memberCount = chain.members.length

  return (
    <section className="border-border/70 bg-card overflow-hidden rounded-xl border shadow-sm">
      <header className="border-border/60 bg-muted/30 flex items-center gap-2 border-b px-4 py-2">
        <RectangleStackIcon className="text-primary size-4 shrink-0" aria-hidden />
        <h3 className="line-clamp-1 text-sm font-semibold">{seriesName}</h3>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {NS.series.members_now(formatCkbDigits(memberCount))}
        </span>
        {chain.seriesId ? (
          <Link
            href={`/dashboard/writings/series/${chain.seriesId}`}
            className="text-primary hover:text-primary/80 ms-auto shrink-0 text-xs font-medium transition-colors"
          >
            {NS.action.view_series_short}
          </Link>
        ) : null}
      </header>

      <div className="relative">
        {/* Spine: root cover centre → last child's centre. Rows below use
            fixed padding/height so the coordinates stay exact. */}
        {children.length > 0 ? (
          <>
            <span
              aria-hidden
              className="border-primary/30 absolute start-9 top-10 bottom-8 w-0 border-s-2"
            />
            <span
              aria-hidden
              className="bg-primary/40 absolute start-8 top-9 size-2 rounded-full"
            />
          </>
        ) : null}

        {root ? (
          <button
            type="button"
            onClick={() => onView(root)}
            className="group/chainrow hover:bg-muted/40 flex w-full items-center gap-3 px-4 py-3 text-start transition-colors"
          >
            <WritingCoverThumb writing={root} className="h-14 w-10" />
            <ChainRowBody row={root} titleClass="text-[15px]" />
            <span className="bg-primary/10 text-primary inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-semibold">
              {NS.series.parent_badge}
            </span>
            <VolumePill order={root.seriesOrder ?? root.seriesInfo?.seriesOrder} />
            <span className="hidden sm:block">
              <WritingListLangChips langs={root.contentLanguages ?? []} />
            </span>
            <RowActions row={root} onView={onView} onEdit={onEdit} onDelete={onDelete} />
          </button>
        ) : null}

        {children.map((child) => (
          <button
            key={child.id ?? child.sortTitleCkb}
            type="button"
            onClick={() => onView(child)}
            className={cn(
              "group/chainrow hover:bg-muted/40 relative flex w-full items-center py-2 pe-4 text-start transition-colors",
              // elbow tick: spine → row content
              "after:border-primary/30 after:absolute after:start-9 after:top-1/2 after:h-0 after:w-9 after:border-t-2",
            )}
          >
            <span className="flex w-full min-w-0 items-center gap-3 ps-[4.75rem]">
              <WritingCoverThumb writing={child} className="h-12 w-9" />
              <ChainRowBody row={child} titleClass="text-sm" />
              <VolumePill order={child.seriesOrder ?? child.seriesInfo?.seriesOrder} />
              <span className="hidden sm:block">
                <WritingListLangChips langs={child.contentLanguages ?? []} />
              </span>
              <RowActions row={child} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function WritingsSeriesChains({
  chains,
  onView,
  onEdit,
  onDelete,
}: {
  chains: SeriesChain[]
  onView: (row: WritingAdminTableRow) => void
  onEdit: (row: WritingAdminTableRow) => void
  onDelete: (row: WritingAdminTableRow) => void
}) {
  if (chains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RectangleStackIcon
          className="text-muted-foreground/40 mb-4 size-12"
          aria-hidden
        />
        <h2 className="text-foreground mb-2 text-base font-medium">
          {NS.series.empty.title}
        </h2>
        <p className="text-muted-foreground mb-4 max-w-md text-sm">
          {NS.series.empty.subtitle}
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-5">
      {chains.map((chain) => (
        <SeriesChainBlock
          key={chain.key}
          chain={chain}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
