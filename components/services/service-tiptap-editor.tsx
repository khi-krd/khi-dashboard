"use client"

import type { ReactNode } from "react"
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
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn("size-8 shrink-0 rounded-md", className)}
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

export function ServiceTiptapEditor({
  value,
  onChange,
  placeholder,
  contentMinHeightClass = "min-h-[480px]",
  compact = false,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  contentMinHeightClass?: string
  compact?: boolean
}) {
  return (
    <TooltipProvider delay={200}>
      <div className="border-border overflow-hidden rounded-lg border">
        {!compact ? (
          <div className="border-border bg-muted/30 flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
            <ToolbarBtn label="paragraph">
              <span className="text-xs font-medium">P</span>
            </ToolbarBtn>
            <ToolbarBtn label="H1">
              <span className="text-xs font-bold">H1</span>
            </ToolbarBtn>
            <ToolbarBtn label="H2">
              <span className="text-xs font-bold">H2</span>
            </ToolbarBtn>
            <ToolbarBtn label="H3">
              <span className="text-xs font-bold">H3</span>
            </ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn label="bold">
              <BoldIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="italic">
              <ItalicIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="underline">
              <UnderlineIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="strike">
              <StrikethroughIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn label="list">
              <ListBulletIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="ordered">
              <NumberedListIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="quote">
              <ChatBubbleLeftRightIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="code">
              <CodeBracketSquareIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn label="link">
              <LinkIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="image">
              <PhotoIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="hr">
              <MinusIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="table">
              <TableCellsIcon className="size-4" />
            </ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn label="align start">
              <Bars3BottomRightIcon className="size-4 rtl:rotate-180" />
            </ToolbarBtn>
            <ToolbarBtn label="align center">
              <Bars3Icon className="size-4" />
            </ToolbarBtn>
            <ToolbarBtn label="align end">
              <Bars3BottomLeftIcon className="size-4 rtl:rotate-180" />
            </ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn label="undo">
              <ArrowUturnLeftIcon className="size-4 rtl:rotate-180" />
            </ToolbarBtn>
            <ToolbarBtn label="redo">
              <ArrowUturnRightIcon className="size-4 rtl:rotate-180" />
            </ToolbarBtn>
            <ToolbarBtn label="preview" className="ms-auto">
              <EyeIcon className="size-4" />
            </ToolbarBtn>
          </div>
        ) : (
          <div className="border-border bg-muted/30 flex flex-wrap gap-0.5 border-b px-2 py-1">
            <ToolbarBtn label="bold">
              <BoldIcon className="size-3.5" />
            </ToolbarBtn>
            <ToolbarBtn label="italic">
              <ItalicIcon className="size-3.5" />
            </ToolbarBtn>
            <ToolbarBtn label="list">
              <ListBulletIcon className="size-3.5" />
            </ToolbarBtn>
            <ToolbarBtn label="link">
              <LinkIcon className="size-3.5" />
            </ToolbarBtn>
          </div>
        )}
        <div
          contentEditable
          suppressContentEditableWarning
          className={cn(
            "prose prose-base dark:prose-invert max-w-none px-4 py-3 outline-none",
            contentMinHeightClass,
            !value?.trim() &&
              "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
          )}
          dangerouslySetInnerHTML={{ __html: value }}
          onInput={(e) =>
            onChange((e.target as HTMLDivElement).innerHTML)
          }
          data-placeholder={placeholder}
        />
      </div>
    </TooltipProvider>
  )
}
