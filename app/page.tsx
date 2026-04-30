import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"

export default async function Page() {
  const t = await getTranslations("Home")

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("title")}</h1>
          <p>{t("line1")}</p>
          <p>{t("line2")}</p>
          <Button className="mt-2">{t("demoButton")}</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">{t("toggleHint")}</div>
      </div>
    </div>
  )
}
