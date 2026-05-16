import { redirect } from "next/navigation"

export default function LegacyServicePage() {
  redirect("/dashboard/services")
}
