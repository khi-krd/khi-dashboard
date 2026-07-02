"use client"

import { useRef, useState, type ReactNode } from "react"
import type { Editor } from "@tiptap/react"
import { toast } from "sonner"
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  BoldIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketSquareIcon,
  EyeIcon,
  ItalicIcon,
  LinkIcon,
  ListBulletIcon,
  MinusIcon,
  MusicalNoteIcon,
  NumberedListIcon,
  PaperClipIcon,
  PhotoIcon,
  RectangleGroupIcon,
  StrikethroughIcon,
  TableCellsIcon,
  UnderlineIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"

import { TIPTAP_NS } from "@/components/shared/tiptap-strings"
import {
  insertUploadedAudio,
  insertUploadedFile,
  insertUploadedGallery,
  insertUploadedImage,
  insertUploadedVideo,
} from "@/lib/tiptap-media"
import { uploadMedia, uploadMediaMultiple } from "@/services/mediaService"
import type { MediaUploadResultDto, MediaUploadType } from "@/types/media"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

function ToolbarSep({ className }: { className?: string }) {
  return (
    <Separator
      orientation="vertical"
      className={cn("data-vertical:h-auto mx-1 h-5 shrink-0", className)}
    />
  )
}

function ToolbarBtn({
  label,
  pressed,
  disabled,
  onClick,
  children,
  className,
}: {
  label: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
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
            aria-pressed={pressed ?? undefined}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function promptLink(editor: Editor) {
  const prev = editor.getAttributes("link").href as string | undefined
  const next =
    typeof window !== "undefined"
      ? window.prompt(TIPTAP_NS.prompt.link, prev ?? "")
      : null
  if (next === null) return
  if (!next.trim()) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange("link").setLink({ href: next }).run()
}

function MediaUploadButton({
  editor,
  accept,
  type,
  multiple = false,
  label,
  onInsert,
  children,
}: {
  editor: Editor
  accept: string
  type: MediaUploadType
  multiple?: boolean
  label: string
  onInsert: (editor: Editor, results: MediaUploadResultDto[]) => void
  children: ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploading(true)
    try {
      const results = multiple
        ? await uploadMediaMultiple(list, type)
        : [await uploadMedia(list[0], type)]
      onInsert(editor, results)
    } catch {
      toast.error(TIPTAP_NS.error.uploadFailed)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <ToolbarBtn
        label={label}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {children}
      </ToolbarBtn>
    </>
  )
}

export function TiptapToolbar({
  editor,
  variant = "full",
  preview,
  onPreviewToggle,
  sticky = false,
}: {
  editor: Editor
  variant?: "full" | "compact"
  preview?: boolean
  onPreviewToggle?: () => void
  sticky?: boolean
}) {
  const canUndo = editor.can().chain().focus().undo().run()
  const canRedo = editor.can().chain().focus().redo().run()

  const barClass = cn(
    "border-border bg-muted/30 flex shrink-0 flex-wrap items-center gap-0.5 border-b px-2 py-1.5",
    sticky &&
      "supports-backdrop-filter:backdrop-blur bg-background/95 sticky top-0 z-10",
  )

  if (variant === "compact" && !preview) {
    return (
      <TooltipProvider delay={200}>
        <div className={barClass}>
          <ToolbarBtn
            label={TIPTAP_NS.toolbar.bold}
            pressed={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className="size-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            label={TIPTAP_NS.toolbar.italic}
            pressed={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className="size-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            label={TIPTAP_NS.toolbar.bulletList}
            pressed={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListBulletIcon className="size-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            label={TIPTAP_NS.toolbar.link}
            pressed={editor.isActive("link")}
            onClick={() => promptLink(editor)}
          >
            <LinkIcon className="size-3.5 rtl:rotate-180" />
          </ToolbarBtn>
        </div>
      </TooltipProvider>
    )
  }

  if (preview && onPreviewToggle) {
    return (
      <TooltipProvider delay={200}>
        <div className={barClass}>
          <ToolbarBtn
            label={TIPTAP_NS.toolbar.previewExit}
            pressed
            onClick={onPreviewToggle}
            className="ms-auto"
          >
            <EyeIcon className="size-4" />
          </ToolbarBtn>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delay={300}>
      <div className={barClass}>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.paragraph}
          pressed={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <span className="font-mono text-xs">P</span>
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.h1}
          pressed={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <span className="font-mono text-xs">H1</span>
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.h2}
          pressed={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="font-mono text-xs">H2</span>
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.h3}
          pressed={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="font-mono text-xs">H3</span>
        </ToolbarBtn>
        <ToolbarSep />

        <ToolbarBtn
          label={TIPTAP_NS.toolbar.bold}
          pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.italic}
          pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.underline}
          pressed={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.strike}
          pressed={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarSep />

        <ToolbarBtn
          label={TIPTAP_NS.toolbar.bulletList}
          pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBulletIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.orderedList}
          pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <NumberedListIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.blockquote}
          pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <ChatBubbleLeftRightIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.code}
          pressed={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <CodeBracketSquareIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarSep />

        <ToolbarBtn
          label={TIPTAP_NS.toolbar.link}
          pressed={editor.isActive("link")}
          onClick={() => promptLink(editor)}
        >
          <LinkIcon className="size-4 rtl:rotate-180" />
        </ToolbarBtn>
        <MediaUploadButton
          editor={editor}
          type="image"
          accept="image/*"
          label={TIPTAP_NS.toolbar.image}
          onInsert={(ed, results) =>
            insertUploadedImage(ed, results[0].fileUrl)
          }
        >
          <PhotoIcon className="size-4" />
        </MediaUploadButton>
        <MediaUploadButton
          editor={editor}
          type="image"
          accept="image/*"
          multiple
          label={TIPTAP_NS.toolbar.gallery}
          onInsert={(ed, results) =>
            insertUploadedGallery(
              ed,
              results.map((r) => ({ src: r.fileUrl })),
            )
          }
        >
          <RectangleGroupIcon className="size-4" />
        </MediaUploadButton>
        <MediaUploadButton
          editor={editor}
          type="video"
          accept="video/*"
          label={TIPTAP_NS.toolbar.video}
          onInsert={(ed, results) =>
            insertUploadedVideo(ed, results[0].fileUrl)
          }
        >
          <VideoCameraIcon className="size-4" />
        </MediaUploadButton>
        <MediaUploadButton
          editor={editor}
          type="audio"
          accept="audio/*"
          label={TIPTAP_NS.toolbar.audio}
          onInsert={(ed, results) =>
            insertUploadedAudio(ed, results[0].fileUrl)
          }
        >
          <MusicalNoteIcon className="size-4" />
        </MediaUploadButton>
        <MediaUploadButton
          editor={editor}
          type="document"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv,.json"
          label={TIPTAP_NS.toolbar.file}
          onInsert={(ed, results) =>
            insertUploadedFile(ed, results[0].fileUrl, results[0].fileName)
          }
        >
          <PaperClipIcon className="size-4" />
        </MediaUploadButton>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.horizontalRule}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <MinusIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.table}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableCellsIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarSep />

        <ToolbarBtn
          label={TIPTAP_NS.toolbar.alignStart}
          pressed={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <Bars3BottomRightIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.alignCenter}
          pressed={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <Bars3Icon className="size-4" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.alignEnd}
          pressed={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <Bars3BottomLeftIcon className="size-4" />
        </ToolbarBtn>
        <ToolbarSep />

        <ToolbarBtn
          label={TIPTAP_NS.toolbar.undo}
          disabled={!canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <ArrowUturnLeftIcon className="size-4 rtl:rotate-180" />
        </ToolbarBtn>
        <ToolbarBtn
          label={TIPTAP_NS.toolbar.redo}
          disabled={!canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <ArrowUturnRightIcon className="size-4 rtl:rotate-180" />
        </ToolbarBtn>
        {onPreviewToggle ? (
          <ToolbarBtn
            label={
              preview ? TIPTAP_NS.toolbar.previewExit : TIPTAP_NS.toolbar.preview
            }
            pressed={preview}
            onClick={onPreviewToggle}
            className={cn(!sticky && "ms-auto")}
          >
            <EyeIcon className="size-4" />
          </ToolbarBtn>
        ) : null}
      </div>
    </TooltipProvider>
  )
}
