"use client"

import dynamic from "next/dynamic"

import { tiptapEditorShellClass } from "@/components/shared/tiptap-editor"
import type {
  TiptapEditorProps,
  TiptapViewerProps,
} from "@/components/shared/tiptap-editor"

export type { TiptapEditorProps, TiptapViewerProps }

/**
 * Loading placeholder rendered while the TipTap chunk downloads. Reuses the
 * editor shell class so the skeleton is visually identical to the real shell
 * (no layout shift / design change).
 */
function EditorSkeleton() {
  return (
    <div className={tiptapEditorShellClass()}>
      <div className="bg-background min-h-[320px] animate-pulse" />
    </div>
  )
}

/**
 * Code-split TipTap editor. The ProseMirror/TipTap bundle (~200KB+) is removed
 * from every form route's initial JS and fetched on demand. Drop-in replacement
 * for `@/components/shared/tiptap-editor` — same props, same behavior.
 */
export const TiptapEditor = dynamic(
  () => import("@/components/shared/tiptap-editor").then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <EditorSkeleton /> },
) as (props: TiptapEditorProps) => React.ReactElement

export const TiptapViewer = dynamic(
  () => import("@/components/shared/tiptap-editor").then((m) => m.TiptapViewer),
  { ssr: false, loading: () => <EditorSkeleton /> },
) as (props: TiptapViewerProps) => React.ReactElement
