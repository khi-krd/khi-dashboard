/**
 * Headless round-trip check for the rich-text schema: parse HTML the editor
 * emits (and legacy Markdown), run the layout commands, and make sure the
 * serialized HTML carries every attribute the public site renders.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/tiptap-roundtrip.ts
 *
 * Needs `jsdom` resolvable (it is not a project dependency).
 */
import { JSDOM } from "jsdom"

const dom = new JSDOM("<!doctype html><html><body></body></html>")
const g = globalThis as unknown as Record<string, unknown>
g.window = dom.window
g.document = dom.window.document
Object.defineProperty(g, "navigator", { value: dom.window.navigator, configurable: true })
for (const key of [
  "HTMLElement",
  "Element",
  "Node",
  "DOMParser",
  "MutationObserver",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "Range",
  "Selection",
  "InputEvent",
  "KeyboardEvent",
  "MouseEvent",
  "CustomEvent",
  "XMLSerializer",
]) {
  if (!(key in g)) g[key] = (dom.window as unknown as Record<string, unknown>)[key]
}

async function main() {
  const { Editor } = await import("@tiptap/core")
  const { createTiptapExtensions } = await import(
    "../components/shared/tiptap-extensions"
  )
  const { tiptapContentType } = await import("../components/shared/tiptap-content")

  const stored =
    '<p dir="ltr" style="text-align: center"><span style="font-family: &quot;Rabar&quot;; font-size: 24px; color: #8c1515">Hi</span> <mark data-color="#fde68a" style="background-color: #fde68a; color: inherit">hl</mark> H<sub>2</sub>O</p>' +
    '<figure class="rt-figure" data-align="right" data-width="50"><img src="https://x/a.jpg" alt="a"><figcaption>cap</figcaption></figure>' +
    '<div class="rt-columns" data-cols="3"><div class="rt-column"><p>a</p></div><div class="rt-column"><p>b</p></div><div class="rt-column"><p>c</p></div></div>' +
    '<figure class="rt-table"><table data-style="striped"><tbody><tr><th colspan="2" style="background-color: rgb(254, 243, 199)">h</th></tr><tr><td>1</td><td>2</td></tr></tbody></table><figcaption>t</figcaption></figure>'

  const editor = new Editor({
    extensions: createTiptapExtensions({ editable: true }),
    content: stored,
    contentType: tiptapContentType(stored),
  })

  const out = editor.getHTML()
  const checks: [string, boolean][] = [
    ['dir="ltr"', out.includes('dir="ltr"')],
    ["text-align: center", out.includes("text-align: center")],
    ["font-family Rabar", /font-family:\s*&quot;Rabar&quot;|font-family:\s*Rabar/.test(out)],
    ["font-size 24px", out.includes("font-size: 24px")],
    ["color #8c1515", out.includes("#8c1515") || out.includes("rgb(140, 21, 21)")],
    ["<mark", out.includes("<mark")],
    ["<sub>", out.includes("<sub>2</sub>")],
    ["figure rt-figure", out.includes('class="rt-figure"')],
    ['data-align="right"', out.includes('data-align="right"')],
    ['data-width="50"', out.includes('data-width="50"')],
    ["<figcaption>cap", out.includes("<figcaption>cap</figcaption>")],
    ["rt-columns 3", out.includes('class="rt-columns"') && out.includes('data-cols="3"')],
    ["3 rt-column", (out.match(/class="rt-column"/g) ?? []).length === 3],
    ["rt-table figure", out.includes('class="rt-table"')],
    ['data-style="striped"', out.includes('data-style="striped"')],
    ['colspan="2"', out.includes('colspan="2"')],
    ["cell bg", out.includes("background-color: rgb(254, 243, 199)")],
    ["table caption", out.includes("<figcaption>t</figcaption>")],
  ]

  // Commands: direction, figure placement, table style, columns removal.
  editor.commands.setContent("<p>one</p><p>two</p>", { contentType: "html" })
  editor.commands.selectAll()
  editor.commands.setTextDirection("rtl")
  checks.push(["setTextDirection", editor.getHTML().includes('dir="rtl"')])
  editor.commands.insertImageFigure({ src: "https://x/b.jpg", caption: "c", align: "left", width: 33 })
  checks.push(["insertImageFigure", /data-align="left" data-width="33"|data-width="33" data-align="left"/.test(editor.getHTML())])
  editor.commands.insertColumns(2)
  checks.push(["insertColumns", editor.getHTML().includes('data-cols="2"')])
  editor.commands.unsetColumns()
  checks.push(["unsetColumns", !editor.getHTML().includes("rt-columns")])
  editor.commands.insertCaptionedTable({ rows: 2, cols: 2 })
  editor.commands.setTableStyle("minimal")
  editor.commands.setTableCaption("Caption!")
  editor.commands.setCellBackground("#bbf7d0")
  const html3 = editor.getHTML()
  checks.push(["setTableStyle", html3.includes('data-style="minimal"')])
  checks.push(["setTableCaption", html3.includes("<figcaption>Caption!</figcaption>")])
  checks.push(["setCellBackground", html3.includes("background-color: #bbf7d0") || html3.includes("rgb(187, 247, 208)")])

  // Legacy Markdown still parses.
  const md = "## Title\n\nSome **bold** text\n\n<div class=\"gallery\"><img src=\"https://x/g.jpg\"></div>"
  editor.commands.setContent(md, { contentType: tiptapContentType(md) })
  const html4 = editor.getHTML()
  checks.push(["markdown heading", html4.includes("<h2")])
  checks.push(["markdown bold", html4.includes("<strong>bold</strong>")])
  checks.push(["markdown gallery", html4.includes('class="gallery"')])
  checks.push(["empty doc → \"\"", (() => { editor.commands.clearContent(); return editor.isEmpty })()])

  let failed = 0
  for (const [name, ok] of checks) {
    console.log(`${ok ? "ok  " : "FAIL"} ${name}`)
    if (!ok) failed++
  }
  if (failed) {
    console.log("\n--- output ---\n" + out)
    process.exit(1)
  }
  console.log(`\n${checks.length} checks passed`)
  editor.destroy()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
