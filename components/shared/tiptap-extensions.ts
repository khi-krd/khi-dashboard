import Highlight from "@tiptap/extension-highlight"
import { Markdown } from "@tiptap/markdown"
import Placeholder from "@tiptap/extension-placeholder"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { TableRow } from "@tiptap/extension-table-row"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyleKit } from "@tiptap/extension-text-style"
import StarterKit from "@tiptap/starter-kit"

import {
  Audio,
  FileLink,
  Gallery,
  Video,
} from "@/components/shared/tiptap-media-nodes"
import {
  Column,
  Columns,
  ImageBackdrop,
  ImageFigure,
  ImageFloat,
  RichTable,
  RichTableCell,
  RichTableHeader,
  TextDirection,
} from "@/components/shared/tiptap-rich-nodes"

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
        levels: [1, 2, 3, 4],
      },
      // StarterKit v3 already bundles Link + Underline.
      link: {
        openOnClick: !editable,
        autolink: true,
        defaultProtocol: "https",
      },
    }),
    Subscript,
    Superscript,
    Highlight.configure({ multicolor: true }),
    // TextStyle + FontFamily + FontSize + Color + BackgroundColor + LineHeight
    TextStyleKit.configure({ lineHeight: false }),
    TextDirection,
    // Every <img> — pasted, linked or legacy — parses as a figure so it gets
    // the placement bar; there is no bare image node anymore.
    ImageFigure,
    ImageBackdrop,
    ImageFloat,
    Columns,
    Column,
    Gallery,
    Video,
    Audio,
    FileLink,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    RichTable.configure({
      resizable: editable,
      cellMinWidth: 60,
    }),
    TableRow,
    RichTableHeader,
    RichTableCell,
    Placeholder.configure({
      placeholder: placeholder ?? "",
      emptyEditorClass: "text-muted-foreground",
    }),
    Markdown.configure({
      markedOptions: { gfm: true },
    }),
  ]
}
