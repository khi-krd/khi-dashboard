import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="flex min-h-svh flex-col items-center justify-center gap-3 p-6"
    >
      <p className="text-muted-foreground font-mono text-5xl font-semibold">
        404
      </p>
      <h1 className="text-lg font-medium">ئەم پەڕەیە نەدۆزرایەوە</h1>
      <p className="text-muted-foreground max-w-md text-center text-sm">
        ڕەنگە بەستەرەکە هەڵە بێت یان پەڕەکە سڕابێتەوە.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-1 rounded-md"
        render={<Link href="/dashboard" />}
      >
        گەڕانەوە بۆ داشبۆرد
      </Button>
    </div>
  )
}
