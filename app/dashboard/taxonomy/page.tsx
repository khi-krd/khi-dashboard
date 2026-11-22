import { Suspense } from "react"

import { TaxonomyClient } from "@/components/taxonomy/taxonomy-client"

export default function TaxonomyPage() {
  return (
    <Suspense>
      <TaxonomyClient />
    </Suspense>
  )
}
