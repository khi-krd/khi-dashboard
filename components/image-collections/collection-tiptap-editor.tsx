"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BoldIcon,
  CodeBracketSquareIcon,
  ItalicIcon,
  LinkIcon,
  ListBulletIcon,
  NumberedListIcon,
  PhotoIcon,
  StrikethroughIcon,
  TableCellsIcon,
  UnderlineIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  MinusIcon,
} from "@heroicons/react/24/outline"

import { NS } from "@/components/image-collections/collections-strings"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function ToolbarSep() {
  return <div className="bg-border mx-1 h-5 w-px shrink-0" aria-hidden />
}

function ToolbarBtn({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0 rounded-md"
            disabled
            tabIndex={-1}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export function CollectionTiptapEditor({
  value,
  onChange,
  placeholder,
  lang,
  minHeight = "min-h-[320px]",
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  lang: "CKB" | "KMR"
  minHeight?: string
}) {
  const ph =
    placeholder ??
    (lang === "CKB" ? NS.field.body.ckb : NS.field.body.kmr)
  const ref = useRef<HTMLDivElement>(null)

  const syncFromProp = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (el.innerHTML !== value) el.innerHTML = value
  }, [value])

  useEffect(() => {
    syncFromProp()
  }, [syncFromProp])

  return (
    <TooltipProvider delay={300}>
      <div>
        <div className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-14 z-20 mb-3 flex flex-wrap items-center gap-0.5 rounded-lg border p-1">
          <ToolbarBtn label="قەڵەو">
            <BoldIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="لار">
            <ItalicIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="ژێرەوە">
            <UnderlineIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="هێڵ بەسەر">
            <StrikethroughIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarSep />
          <ToolbarBtn label="لیست">
            <ListBulletIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="لیستی ژمارەیی">
            <NumberedListIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="وتە">
            <ChatBubbleLeftRightIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="کۆد">
            <CodeBracketSquareIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarSep />
          <ToolbarBtn label="لینک">
            <LinkIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="وێنە">
            <PhotoIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="هێڵ">
            <MinusIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="خشتە">
            <TableCellsIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarSep />
          <ToolbarBtn label="ڕاست">
            <Bars3BottomRightIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="ناوەند">
            <Bars3Icon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="چەپ">
            <Bars3BottomLeftIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarSep />
          <ToolbarBtn label="گەڕانەوە">
            <ArrowUturnLeftIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="دووبارەکردنەوە">
            <ArrowUturnRightIcon className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn label="پێشبینین">
            <EyeIcon className="size-4" />
          </ToolbarBtn>
        </div>

        <div
          ref={ref}
          dir={lang === "KMR" ? "ltr" : "rtl"}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={ph}
          className={cn(
            "collection-editor-body prose prose-sm md:prose-base max-w-none dark:prose-invert",
            minHeight,
            "mt-3 focus:outline-none",
          )}
          onInput={(e) => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
        />
      </div>
    </TooltipProvider>
  )
}
