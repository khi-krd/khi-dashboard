"use client"

import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

import { COMPRESS_NS } from "@/components/shared/compress-strings"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { formatEnDigits } from "@/lib/intl-ckb"
import {
  DEFAULT_COMPRESSION_SETTINGS,
  type CompressionSettings,
} from "@/lib/image-compression"
import { cn } from "@/lib/utils"

export type { CompressionSettings }
export { DEFAULT_COMPRESSION_SETTINGS }

const NS = COMPRESS_NS.toggle

/**
 * "باشکردنی وێنە پێش بارکردن" — ON/OFF switch + hint + expandable advanced
 * settings (quality, target KB, keep-dimensions, WebP). Purely presentational:
 * settings state lives in the caller.
 */
export function CompressionToggle({
  value,
  onChange,
  disabled = false,
  className,
}: {
  value: CompressionSettings
  onChange: (settings: CompressionSettings) => void
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)

  function patch(partial: Partial<CompressionSettings>) {
    onChange({ ...value, ...partial })
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "border-border/70 bg-muted/20 space-y-2 rounded-lg border px-3 py-2.5",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Switch
              size="sm"
              checked={value.enabled}
              onCheckedChange={(checked) =>
                patch({ enabled: checked === true })
              }
              disabled={disabled}
              aria-label={NS.label}
            />
            <span className="truncate text-xs font-medium">{NS.label}</span>
            {!value.enabled ? (
              <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                {NS.originalBadge}
              </span>
            ) : null}
          </div>
          {value.enabled ? (
            <CollapsibleTrigger
              className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-[11px] transition-colors"
              disabled={disabled}
            >
              {NS.advanced}
              <ChevronDownIcon
                className={cn(
                  "size-3.5 transition-transform",
                  open && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
          ) : null}
        </div>

        <p className="text-muted-foreground text-[11px] leading-relaxed">
          {NS.hint}
        </p>

        {value.enabled ? (
          <CollapsibleContent className="space-y-3 pt-1">
            {/* Quality — 50–100. Re-compression of staged files is debounced
                in the hook, so per-tick updates are safe. */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-[11px]">
                  {NS.quality}
                </Label>
                <span
                  dir="ltr"
                  className="text-muted-foreground text-[11px] tabular-nums"
                >
                  {formatEnDigits(value.qualityPct)}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={1}
                dir="ltr"
                disabled={disabled}
                value={value.qualityPct}
                onChange={(e) =>
                  patch({ qualityPct: Number(e.target.value) })
                }
                className="accent-primary w-full"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-[11px]">
                {NS.targetSize}
              </Label>
              <Input
                type="number"
                dir="ltr"
                min={0}
                className="h-8 w-32 font-mono text-xs"
                placeholder={NS.targetPlaceholder}
                disabled={disabled}
                value={value.maxSizeKB ?? ""}
                onChange={(e) => {
                  const raw = e.target.value.trim()
                  const parsed = Number(raw)
                  patch({
                    maxSizeKB:
                      raw === "" || Number.isNaN(parsed) || parsed <= 0
                        ? null
                        : parsed,
                  })
                }}
              />
            </div>

            <div className="border-border/60 space-y-2 border-t pt-3">
              <span className="text-[11px] font-medium">{NS.pngSection}</span>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-[11px]">
                  {NS.pngTarget}
                </Label>
                <Input
                  type="number"
                  dir="ltr"
                  min={0}
                  className="h-8 w-32 font-mono text-xs"
                  placeholder={NS.targetPlaceholder}
                  disabled={disabled}
                  value={value.pngMaxSizeKB ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value.trim()
                    const parsed = Number(raw)
                    patch({
                      pngMaxSizeKB:
                        raw === "" || Number.isNaN(parsed) || parsed <= 0
                          ? null
                          : parsed,
                    })
                  }}
                />
              </div>

            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange({ ...DEFAULT_COMPRESSION_SETTINGS })
                }
                className="text-muted-foreground hover:text-foreground text-[11px] underline-offset-2 transition-colors hover:underline"
              >
                {NS.reset}
              </button>
            </div>
          </CollapsibleContent>
        ) : null}
      </div>
    </Collapsible>
  )
}
