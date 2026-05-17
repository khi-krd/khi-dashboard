"use client"

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  CloudArrowUpIcon,
  LinkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import { useRef, useState } from "react"

import { NS } from "@/components/about/about-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroDropzone({
  previewUrl,
  onFile,
  onClear,
  urlValue,
  onUrlChange,
  onUrlApply,
}: {
  previewUrl: string | null
  onFile: (file: File) => void
  onClear: () => void
  urlValue: string
  onUrlChange: (v: string) => void
  onUrlApply: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  if (previewUrl?.trim()) {
    return (
      <div className="group relative aspect-[8/3] overflow-hidden rounded-xl bg-muted">
        <Image
          src={previewUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 860px) 100vw, 860px"
        />
        <div className="absolute inset-0 flex items-end justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-background/90 backdrop-blur"
            onClick={() => inputRef.current?.click()}
          >
            <ArrowPathIcon className="me-1 size-3.5" />
            {NS.form.hero_change}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-background/90 text-destructive backdrop-blur hover:text-destructive"
            onClick={onClear}
          >
            <TrashIcon className="me-1 size-3.5" />
            {NS.form.hero_remove}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
        />
      </div>
    )
  }

  return (
    <>
      <label
        htmlFor="hero-upload"
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f?.type.startsWith("image/")) onFile(f)
        }}
        className={`block aspect-[8/3] cursor-pointer rounded-xl border-2 border-dashed transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-foreground/30 bg-muted/20 hover:bg-muted/40"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <CloudArrowUpIcon className="text-muted-foreground/60 size-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{NS.form.hero_empty}</p>
            <p className="text-muted-foreground mt-1 text-xs">{NS.form.hero_drop}</p>
            <p className="text-muted-foreground/70 mt-1 font-mono text-[10px]">
              {NS.form.hero_size}
            </p>
          </div>
        </div>
        <input
          id="hero-upload"
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
        />
      </label>

      <details className="group mt-2">
        <summary className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-xs">
          <ChevronLeftIcon className="size-3 transition-transform group-open:-rotate-90 rtl:rotate-180 rtl:group-open:rotate-90" />
          {NS.form.url_fallback}
        </summary>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="text-muted-foreground absolute end-3 top-1/2 size-3.5 -translate-y-1/2" />
            <Input
              value={urlValue}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://…"
              className="h-9 pe-10 ps-3 text-sm"
            />
          </div>
          <Button type="button" variant="outline" size="sm" className="h-9" onClick={onUrlApply}>
            <ArrowDownTrayIcon className="me-1 size-3.5" />
            {NS.form.url_load}
          </Button>
        </div>
      </details>
    </>
  )
}
