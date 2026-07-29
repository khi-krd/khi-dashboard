import { redirect } from "next/navigation"

export default function NewAboutRedirect() {
  redirect("/dashboard/about")
}
