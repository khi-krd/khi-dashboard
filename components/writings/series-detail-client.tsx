"use client"

import { BookOpenIcon, LinkIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
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
import { Input } from "@/components/ui/input"
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
  useWritingsListQuery,
} from "@/hooks/useWritings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { getWritingCoverUrl } from "@/types/writings-ui"
import type { WritingDto } from "@/types/writings"
import type { WritingsListQueryKeyParts } from "@/types/writings-ui"

const listParams: WritingsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  searchMode: "keyword",
  topicId: null,
  languageFilter: "all",
}

function writingTitle(w: WritingDto): string {
  return (
    w.ckbContent?.title?.trim() ||
    w.kmrContent?.title?.trim() ||
    NS.dash
  )
}

function bookOrder(w: WritingDto): number {
  return w.seriesOrder ?? w.seriesInfo?.seriesOrder ?? 0
}

function bookTotal(w: WritingDto, fallback: number): number {
  return w.seriesInfo?.totalBooks ?? w.seriesTotalBooks ?? fallback
}

function ShelfBookCard({
  book,
  total,
}: {
  book: WritingDto
  total: number
}) {
  const order = bookOrder(book)
  const cover = getWritingCoverUrl(book)
  const title = writingTitle(book)

  if (!book.id) return null

  return (
    <Link
      href={`/dashboard/writings/${book.id}`}
      className="group relative w-[120px] shrink-0"
    >
      <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg border shadow-sm transition-shadow group-hover:shadow-md">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover"
            unoptimized={cover.startsWith("http")}
          />
        ) : (
          <div className="text-muted-foreground/50 flex h-full items-center justify-center">
            <BookOpenIcon className="size-10" aria-hidden />
          </div>
        )}
        {order > 0 ? (
          <span className="bg-background/95 text-foreground absolute start-2 top-2 rounded-md px-1.5 py-0.5 font-mono text-xs shadow-sm">
            {formatCkbDigits(order)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-center text-xs font-medium">
        {title}
      </p>
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
  seriesId,
  seriesName,
  parentBookId,
  nextOrder,
  existingBookIds,
  onLinked,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  seriesId: string
  seriesName?: string | null
  parentBookId: number
  nextOrder: number
  existingBookIds: Set<number>
  onLinked: () => void
}) {
  const writingsQ = useWritingsListQuery(listParams)
  const linkMut = useLinkToSeriesMutation()
  const [bookId, setBookId] = useState<string>("")
  const [seriesOrder, setSeriesOrder] = useState(String(nextOrder))

  const candidates = useMemo(() => {
    return (writingsQ.data?.content ?? []).filter((w) => {
      if (!w.id || existingBookIds.has(w.id)) return false
      const sid = w.seriesId?.trim() || w.seriesInfo?.seriesId?.trim()
      return !sid
    })
  }, [writingsQ.data?.content, existingBookIds])

  function handleClose(next: boolean) {
    if (!next) {
      setBookId("")
      setSeriesOrder(String(nextOrder))
    }
    onOpenChange(next)
  }

  async function handleSubmit() {
    const id = Number(bookId)
    const order = Number(seriesOrder)
    if (!Number.isFinite(id) || id <= 0) return
    try {
      await linkMut.mutateAsync({
        bookId: id,
        parentBookId,
        seriesOrder: Number.isFinite(order) && order > 0 ? order : nextOrder,
        seriesName: seriesName?.trim() || undefined,
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
                    {writingTitle(w)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{NS.field.series_order}</Label>
            <Input
              type="number"
              min={1}
              value={seriesOrder}
              onChange={(e) => setSeriesOrder(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              {NS.field.series_order_helper}
            </p>
          </div>
          <p className="text-muted-foreground text-xs">
            {NS.series.dialog.series_picker}: {seriesName || seriesId}
          </p>
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
  const [linkOpen, setLinkOpen] = useState(false)

  const series = detailQ.data
  const books = series?.books ?? []
  const total = Math.max(
    books.length,
    series?.parentBook
      ? bookTotal(series.parentBook, books.length)
      : books.length,
  )
  const seriesName =
    series?.seriesName?.trim() ||
    series?.parentBook?.seriesName?.trim() ||
    (series?.parentBook ? writingTitle(series.parentBook) : "") ||
    NS.breadcrumb.series

  const existingBookIds = useMemo(() => {
    const ids = new Set<number>()
    for (const b of books) {
      if (b.id) ids.add(b.id)
    }
    if (series?.parentBook?.id) ids.add(series.parentBook.id)
    return ids
  }, [books, series?.parentBook])

  const nextOrder = books.length > 0 ? Math.max(...books.map(bookOrder)) + 1 : 1
  const parentBookId = series?.parentBook?.id ?? books[0]?.parentBookId ?? 0

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
                  key={book.id ?? bookOrder(book)}
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
              seriesId={seriesId}
              seriesName={seriesName}
              parentBookId={parentBookId}
              nextOrder={nextOrder}
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
