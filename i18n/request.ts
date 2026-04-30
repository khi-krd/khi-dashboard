import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async () => ({
  locale: "ckb",
  messages: (await import("../messages/ckb.json")).default,
}))
