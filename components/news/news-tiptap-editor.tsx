"use client"

import { useEffect } from "react"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  BoldIcon,
  CodeBracketSquareIcon,
  ItalicIcon,
  LinkIcon,
  ListBulletIcon,
  PhotoIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

import { NS } from "@/components/news/news-strings"

const extensions = ({
  editable,
  placeholder,
}: {
  editable: boolean
  placeholder?: string
}) => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Underline,
  Link.configure({
    openOnClick: editable,
    autolink: true,
    defaultProtocol: "https",
  }),
  Image.configure({
    inline: false,
    allowBase64: true,
  }),
  Placeholder.configure({
    placeholder:
      placeholder ?? NS.field.description,
    emptyEditorClass: "text-muted-foreground",
  }),
]

function ToolbarSeparator() {
  return (
    <Separator orientation="vertical" className="data-vertical:h-auto mx-4 h-full" />
  )
}

export function NewsTiptapEditor({
  value,
  onChange,
  editable = true,
  label,
  error,
  contentMinHeightClass,
}: {
  value: string
  onChange?: (html: string) => void
  editable?: boolean
  label?: string
  error?: string | null | boolean
  /** Min height for the rich-text body (toolbar stays fixed above). */
  contentMinHeightClass?: string
}) {
  const editor = useEditor({
    extensions: extensions({
      editable,
      placeholder:
        editable ? NS.field.description : undefined,
    }),
    editable,
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none dark:prose-invert px-3 py-2 outline-none",
          editable
            ? (contentMinHeightClass ?? "min-h-[320px]")
            : "min-h-36",
          "bg-transparent rounded-none",
          !editable && "prose-img:rounded-md",
        ),
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const cur = editor.getHTML()
    if ((value ?? "") !== cur) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.setEditable(editable)
  }, [editable, editor])

  if (!editor) return null

  return (
    <Field data-invalid={error ? "" : undefined}>
      {label ? <FieldLabel className="text-sm font-semibold">{label}</FieldLabel> : null}

      <div
        className={cn(
          "border-input rounded-lg border bg-popover outline-none transition-[color,box-shadow] focus-within:ring-[3px] focus-within:ring-ring/35 overflow-hidden",
          error &&
            "border-destructive ring-destructive/40 focus-visible:ring-destructive/40 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive dark:aria-invalid:border-destructive",
        )}
      >
        {editable ? (
          <div className="border-border bg-muted/30 flex flex-wrap items-center gap-2 border-b px-2 py-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-pressed={
                editor.isActive("paragraph") && editor.isFocused ? true : undefined
              }
              onClick={() =>
                editor.chain().focus().setParagraph().run()
              }
            >
              ¶
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-pressed={editor.isActive("heading", { level: 2 }) ?? false}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              H2
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-pressed={editor.isActive("heading", { level: 3 }) ?? false}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              H3
            </Button>
            <ToolbarSeparator />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={editor.isActive("bold") ?? false}
              className="rounded-md"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <BoldIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={editor.isActive("italic") ?? false}
              className="rounded-md"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <ItalicIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={editor.isActive("underline") ?? false}
              className="rounded-md"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              U̲
            </Button>

            <ToolbarSeparator />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListBulletIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <QueueListIcon className="size-4" />
            </Button>

            <ToolbarSeparator />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-pressed={editor.isActive("blockquote") ?? false}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              “”
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-pressed={editor.isActive("link") ?? false}
              onClick={() => {
                const prev = editor.getAttributes("link").href as string | undefined
                const next = typeof window !== "undefined"
                  ? window.prompt(NS.field.prompt_link_value, prev ?? "")
                  : null
                if (next === null) return
                if (!next.trim()) {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run()
                  return
                }
                editor.chain().focus().extendMarkRange("link").setLink({ href: next }).run()
              }}
            >
              <LinkIcon className="size-4 rtl:rotate-180" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              aria-pressed={editor.isActive("codeBlock") ?? false}
              onClick={() =>
                editor.chain().focus().toggleCodeBlock().run()
              }
            >
              <CodeBracketSquareIcon className="size-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-md"
              onClick={() => {
                const src =
                  typeof window !== "undefined"
                    ? window.prompt(NS.field.prompt_image_url, "")
                    : null
                if (!src?.trim()) return
                editor.chain().focus().setImage({ src: src.trim() }).run()
              }}
            >
              <PhotoIcon className="size-4" />
            </Button>
          </div>
        ) : null}
        <div className="bg-background min-h-0">
          <EditorContent editor={editor} dir="rtl" />
        </div>
      </div>

      {error && typeof error === "string" ? (
        <FieldError className="text-xs">{error}</FieldError>
      ) : null}
    </Field>
  )
}

export function NewsTiptapViewer({ html }: { html: string | null | undefined }) {
  return (
    <NewsTiptapEditor
      editable={false}
      value={html ?? ""}
    />
  )
}
