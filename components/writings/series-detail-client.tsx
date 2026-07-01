"use client"

import { BookOpenIcon, LinkIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { NS } from "@/components/writings/writings-strings"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  useLinkToSeriesMutation,
  useSeriesDetailQuery,
  useSeriesParentsQuery,
  useWritingsListQuery,
} from "@/hooks/useWritings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { SeriesBookSummary } from "@/types/writings"
import type { WritingsListQueryKeyParts } from "@/types/writings-ui"

const listParams: WritingsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  searchMode: "keyword",
  topicId: null,
  languageFilter: "all",
}

function bookTitle(book: SeriesBookSummary): string {
  return book.titleCkb?.trim() || book.titleKmr?.trim() || NS.dash
}

function ShelfBookCard({
  book,
  total,
}: {
  book: SeriesBookSummary
  total: number
}) {
  const order = book.seriesOrder ?? 0
  const title = bookTitle(book)

  return (
    <Link
      href={`/dashboard/writings/${book.id}`}
      className="group relative w-[120px] shrink-0"
    >
      <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg border shadow-sm transition-shadow group-hover:shadow-md">
        <div className="text-muted-foreground/50 flex h-full items-center justify-center">
          <BookOpenIcon className="size-10" aria-hidden />
        </div>
        {order > 0 ? (
          <span className="bg-background/95 text-foreground absolute start-2 top-2 rounded-md px-1.5 py-0.5 font-mono text-xs shadow-sm">
            {formatCkbDigits(order)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-center text-xs font-medium">{title}</p>
      {order > 0 && total > 1 ? (
        <p className="text-muted-foreground mt-0.5 text-center text-[10px]">
          {NS.series.book_in(formatCkbDigits(order), formatCkbDigits(total))}
        </p>
      ) : null}
    </Link>
  )
}

function SeriesDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-[120px] shrink-0 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function SeriesLinkDialog({
  open,
  onOpenChange,
  seriesName,
  parentBookId,
  existingBookIds,
  onLinked,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  seriesName?: string | null
  parentBookId: number
  existingBookIds: Set<number>
  onLinked: () => void
}) {
  const writingsQ = useWritingsListQuery(listParams)
  const linkMut = useLinkToSeriesMutation()
  const [bookId, setBookId] = useState<string>("")

  const candidates = useMemo(() => {
    return (writingsQ.data?.content ?? []).filter((w) => {
      if (!w.id || existingBookIds.has(w.id)) return false
      const sid = w.seriesId?.trim() || w.seriesInfo?.seriesId?.trim()
      return !sid
    })
  }, [writingsQ.data?.content, existingBookIds])

  function handleClose(next: boolean) {
    if (!next) setBookId("")
    onOpenChange(next)
  }

  async function handleSubmit() {
    const id = Number(bookId)
    if (!Number.isFinite(id) || id <= 0) return
    try {
      await linkMut.mutateAsync({
        bookId: id,
        parentBookId,
      })
      toast.success(NS.toast.linked_to_series)
      onLinked()
      handleClose(false)
    } catch {
      toast.error(NS.error.generic)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{NS.series.dialog.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{NS.series.dialog.book_picker}</Label>
            <Select
              value={bookId || undefined}
              onValueChange={(v) => setBookId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={NS.series.dialog.book_picker} />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.ckbContent?.title?.trim() ||
                      w.kmrContent?.title?.trim() ||
                      `#${w.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {seriesName ? (
            <p className="text-muted-foreground text-xs">{seriesName}</p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
            {NS.action.cancel}
          </Button>
          <Button
            type="button"
            disabled={linkMut.isPending || !bookId}
            onClick={() => void handleSubmit()}
          >
            {linkMut.isPending ? <Spinner className="me-2 size-4" /> : null}
            {NS.series.dialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SeriesDetailClient({ seriesId }: { seriesId: string }) {
  const detailQ = useSeriesDetailQuery(seriesId)
  const parentsQ = useSeriesParentsQuery()
  const [linkOpen, setLinkOpen] = useState(false)

  const series = detailQ.data
  const books = series?.books ?? []
  const total = series?.totalBooks ?? books.length
  const seriesName = series?.seriesName?.trim() || NS.breadcrumb.series

  const parentBookId = useMemo(() => {
    const parent = (parentsQ.data ?? []).find(
      (p) =>
        (p.seriesId?.trim() || p.seriesInfo?.seriesId?.trim()) === seriesId,
    )
    return parent?.id ?? books[0]?.id ?? 0
  }, [parentsQ.data, seriesId, books])

  const existingBookIds = useMemo(() => {
    return new Set(books.map((b) => b.id))
  }, [books])

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <WritingBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardWritingsCrumbHref() },
          { label: NS.breadcrumb.writings, href: "/dashboard/writings" },
          { label: NS.breadcrumb.series, href: "/dashboard/writings/series" },
          { label: seriesName || NS.breadcrumb.series },
        ]}
      />

      {detailQ.isError ? (
        <WritingErrorState onRetry={() => void detailQ.refetch()} />
      ) : detailQ.isLoading ? (
        <SeriesDetailSkeleton />
      ) : !series ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-foreground mb-2 text-base font-medium">
            {NS.not_found.series}
          </h2>
          <Link
            href="/dashboard/writings/series"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-md")}
          >
            {NS.action.back}
          </Link>
        </div>
      ) : (
        <>
          <header className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md">
                  {NS.series.banner_label}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {NS.series.total_books(formatCkbDigits(total))}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{seriesName}</h1>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              disabled={!parentBookId}
              onClick={() => setLinkOpen(true)}
            >
              <LinkIcon className="size-4" />
              {NS.action.link_existing}
            </Button>
          </header>

          {books.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {NS.series.empty.subtitle}
            </p>
          ) : (
            <div className="border-border/60 bg-muted/20 flex flex-wrap justify-center gap-6 rounded-xl border p-6 sm:justify-start">
              {books.map((book) => (
                <ShelfBookCard
                  key={book.id}
                  book={book}
                  total={total}
                />
              ))}
            </div>
          )}

          {parentBookId > 0 ? (
            <SeriesLinkDialog
              open={linkOpen}
              onOpenChange={setLinkOpen}
              seriesName={seriesName}
              parentBookId={parentBookId}
              existingBookIds={existingBookIds}
              onLinked={() => void detailQ.refetch()}
            />
          ) : null}
        </>
      )}

      <Link
        href="/dashboard/writings/series"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-md")}
      >
        {NS.action.back}
      </Link>
    </div>
  )
}
