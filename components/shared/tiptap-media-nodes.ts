import {
  mergeAttributes,
  Node,
  ReactNodeViewRenderer,
  type JSONContent,
} from "@tiptap/react"

import { GalleryNodeView } from "@/components/shared/tiptap-gallery-view"

/**
 * Custom rich-text nodes for embedded media: {@link Video}, {@link Audio},
 * {@link Gallery} and {@link FileLink}.
 *
 * Storage strategy: content is persisted as Markdown via `@tiptap/markdown`.
 * The official markdown serializer DROPS any node that lacks a `renderMarkdown`
 * handler, so each node below emits a small HTML block and reconstructs itself
 * from that block on parse via `parseHTML` (the markdown manager runs raw HTML
 * tokens back through every extension's `parseHTML`). The same HTML survives the
 * public render path (`lib/sanitize-news-html.ts` → marked + DOMPurify), whose
 * allowlist permits `video`, `audio`, `div`, `img`, `a`, `class`, `src`, `href`,
 * `controls`, `download` — but NOT `data-*`, which is why the gallery keys off
 * `class="gallery"` and the file link off `class="file"`.
 *
 * Insertion is done with `insertContent` (see `lib/tiptap-media.ts`), so these
 * nodes intentionally define no custom commands.
 */

export type GalleryImage = {
  src: string
  alt?: string
}

/** Escape a string for safe use inside an HTML double-quoted attribute. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
}

/**
 * `<video controls src="…">` — an atomic block node. Round-trips through
 * Markdown as a raw `<video>` tag.
 */
export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: "video[src]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, { controls: "true", preload: "metadata" }),
    ]
  },

  renderMarkdown: (node: JSONContent) => {
    const src = (node.attrs?.src as string | undefined) ?? ""
    if (!src) return ""
    const title = (node.attrs?.title as string | undefined) ?? ""
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : ""
    // Wrapped in a <div> so `marked` treats it as a block (a bare <video> is
    // tokenized as inline HTML); the wrapper is dropped on re-parse.
    return `<div class="video"><video controls src="${escapeAttr(src)}"${titleAttr}></video></div>`
  },
})

/**
 * `<audio controls src="…">` — an atomic block node. Round-trips through
 * Markdown as a raw `<audio>` tag.
 */
export const Audio = Node.create({
  name: "audio",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: "audio[src]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["audio", mergeAttributes(HTMLAttributes, { controls: "true" })]
  },

  renderMarkdown: (node: JSONContent) => {
    const src = (node.attrs?.src as string | undefined) ?? ""
    if (!src) return ""
    const title = (node.attrs?.title as string | undefined) ?? ""
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : ""
    // Wrapped in a <div> so `marked` treats it as a block (a bare <audio> is
    // tokenized as inline HTML); the wrapper is dropped on re-parse.
    return `<div class="audio"><audio controls src="${escapeAttr(src)}"${titleAttr}></audio></div>`
  },
})

/**
 * An image gallery: `<div class="gallery"><img …><img …></div>`. Stores its
 * images in a single `images` attribute and is an atom (children are not
 * editable individually). Round-trips through Markdown as a single-line
 * `<div class="gallery">` block so it stays one HTML block for `marked`.
 */
export const Gallery = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      images: {
        default: [] as GalleryImage[],
        parseHTML: (element) =>
          Array.from(element.querySelectorAll("img"))
            .map((img) => ({
              src: img.getAttribute("src") ?? "",
              alt: img.getAttribute("alt") ?? "",
            }))
            .filter((img) => img.src.length > 0),
        // The image list is materialized as child <img> elements by the node's
        // renderHTML, so it must not be emitted as a stringified attribute.
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div.gallery" }]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView)
  },

  renderHTML({ node, HTMLAttributes }) {
    const images = (node.attrs.images as GalleryImage[]) ?? []
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "gallery" }),
      ...images.map((img) => ["img", { src: img.src, alt: img.alt ?? "" }]),
    ]
  },

  renderMarkdown: (node: JSONContent) => {
    const images = (node.attrs?.images as GalleryImage[] | undefined) ?? []
    if (!images.length) return ""
    const imgs = images
      .map(
        (img) =>
          `<img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt ?? "")}">`,
      )
      .join("")
    return `<div class="gallery">${imgs}</div>`
  },
})

/**
 * A downloadable document / "other file" link:
 * `<div class="file"><a href="…" download="name.ext" class="file-link">name.ext</a></div>`.
 * Used for PDFs, DOCX, ZIPs, etc. — anything that isn't image/video/audio.
 *
 * It is an atom block (mirrors {@link Video}/{@link Audio}): the `href`/`name`
 * live in attributes and the inner `<a>` is materialized by `renderHTML`, so it
 * round-trips through Markdown as a single `<div class="file">` block rather
 * than as a `[text](url)` link that would be indistinguishable from prose links.
 */
export const FileLink = Node.create({
  name: "fileLink",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (element) =>
          element.querySelector("a")?.getAttribute("href") ?? null,
        // Materialized as the child <a> by renderHTML — not a stringified attr.
        renderHTML: () => ({}),
      },
      name: {
        default: null,
        parseHTML: (element) => {
          const a = element.querySelector("a")
          return (
            a?.textContent?.trim() ||
            a?.getAttribute("download") ||
            a?.getAttribute("href") ||
            null
          )
        },
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: "div.file" }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const href = (node.attrs.href as string | null) ?? ""
    const name = (node.attrs.name as string | null) || href
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "file" }),
      ["a", { href, download: name, class: "file-link" }, name],
    ]
  },

  renderMarkdown: (node: JSONContent) => {
    const href = (node.attrs?.href as string | undefined) ?? ""
    if (!href) return ""
    const name = (node.attrs?.name as string | undefined) || href
    return `<div class="file"><a href="${escapeAttr(href)}" download="${escapeAttr(name)}" class="file-link">${escapeAttr(name)}</a></div>`
  },
})
