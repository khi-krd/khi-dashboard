"use client"

import { useEffect } from "react"

/**
 * Last-resort boundary for errors thrown by the root layout itself. It replaces
 * the whole document, so it must render its own <html>/<body> and cannot rely
 * on the layout's fonts, theme or intl provider. Styles are inline for the same
 * reason — this must render even when the app's CSS never loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ckb" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "1.5rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <h1 style={{ fontSize: "1.125rem", fontWeight: 500, margin: 0 }}>
          هەڵەیەکی چاوەڕوان‌نەکراو ڕوویدا
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "28rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "#a1a1a1",
          }}
        >
          تکایە پەڕەکە نوێ بکەرەوە. ئەگەر کێشەکە بەردەوام بوو، پەیوەندی بە
          بەڕێوەبەری سیستەمەوە بکە.
        </p>
        {error.digest ? (
          <p
            dir="ltr"
            style={{
              margin: 0,
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.75rem",
              color: "#737373",
            }}
          >
            {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "0.25rem",
            cursor: "pointer",
            borderRadius: "0.375rem",
            border: "1px solid #333",
            background: "transparent",
            color: "inherit",
            padding: "0.375rem 0.875rem",
            fontSize: "0.8rem",
            fontFamily: "inherit",
          }}
        >
          دووبارە هەوڵبدەرەوە
        </button>
      </body>
    </html>
  )
}
