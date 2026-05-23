declare module "jsmediatags" {
  interface JsMediaTagsSuccess {
    tags: Record<string, unknown>
  }

  interface JsMediaTagsReader {
    read(
      file: Blob,
      handlers: {
        onSuccess: (result: JsMediaTagsSuccess) => void
        onError: (error: unknown) => void
      },
    ): void
  }

  const jsmediatags: JsMediaTagsReader
  export default jsmediatags
}
