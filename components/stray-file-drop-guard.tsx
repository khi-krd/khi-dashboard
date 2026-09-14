"use client"

import { useEffect } from "react"

/**
 * Swallows file drops that miss a dropzone.
 *
 * A file dropped anywhere the app does not handle is opened by the browser:
 * the dashboard unloads and every unsaved field in every open editor goes
 * with it, which is indistinguishable from "the page reloaded and cleared my
 * form". Dropzones call `stopPropagation()` on their own drop, so the native
 * event never reaches these window listeners — only strays do.
 */
export function StrayFileDropGuard() {
  useEffect(() => {
    const swallow = (event: DragEvent) => {
      // Text dragged between two inputs is a normal editing gesture; only
      // block payloads the browser would navigate to.
      if (!event.dataTransfer?.types.includes("Files")) return
      event.preventDefault()
      if (event.type === "drop" && event.dataTransfer) {
        event.dataTransfer.dropEffect = "none"
      }
    }

    window.addEventListener("dragover", swallow)
    window.addEventListener("drop", swallow)
    return () => {
      window.removeEventListener("dragover", swallow)
      window.removeEventListener("drop", swallow)
    }
  }, [])

  return null
}
