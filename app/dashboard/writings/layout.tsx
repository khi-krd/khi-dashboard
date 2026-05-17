import type { ReactNode } from "react"

export default function WritingsLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 sm:gap-3">{children}</div>
}
