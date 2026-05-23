import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Markdown } from "@tiptap/markdown"
import Placeholder from "@tiptap/extension-placeholder"
import { Table } from "@tiptap/extension-table"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableRow } from "@tiptap/extension-table-row"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"

import {
  Audio,
  FileLink,
  Gallery,
  Video,
} from "@/components/shared/tiptap-media-nodes"

export function createTiptapExtensions({
  editable,
  placeholder,
}: {
  editable: boolean
  placeholder?: string
}) {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Underline,
    Link.configure({
      openOnClick: !editable,
      autolink: true,
      defaultProtocol: "https",
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
    }),
    Gallery,
    Video,
    Audio,
    FileLink,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Table.configure({
      resizable: editable,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder: placeholder ?? "",
      emptyEditorClass: "text-muted-foreground",
    }),
    Markdown.configure({
      markedOptions: { gfm: true },
    }),
  ]
}
