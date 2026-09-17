# khi-dashboard — working notes

## Validation is OFF (testing mode)

Client-side validation is intentionally disabled dashboard-wide — whatever the
editor typed is sent, and the backend's response (surfaced via the error
toasts) is the only judge. Concretely:

- Every `useForm` uses `permissiveResolver` (`lib/permissive-resolver.ts`),
  which runs the zod schema for its `.default()`/`.trim()` transforms but
  always returns `errors: {}`. The zod schemas in `lib/validations/` are
  unchanged — they just can't block a submit anymore.
- `!isValid` was removed from every `submitDisabled` gate (only `isDirty` /
  `pending` remain), and imperative pre-submit guards were deleted (the
  services "empty contents"/"no title" checks, the about-hero title check, the
  writing self-parent check, and the topic-create empty-name check).
- Native HTML gates were stripped: `required`, `minLength`, `maxLength`,
  `pattern`, `min`/`max` on inputs, and `type="email"`/`type="url"` (now
  `type="text"`). `type="number"`/`"date"`/`"file"` and range-slider bounds
  were kept.

To re-enable validation: swap each `permissiveResolver(schema)` back to
`zodResolver(schema)` from `@hookform/resolvers/zod`, and restore the removed
`!isValid` terms / guards / input attributes from git history.

## Verify changes with

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (React Compiler rules are errors, e.g. no ref access during render)
npm run build       # next build
npm run dev         # localhost:3000, proxies the API through /railway-proxy
```

Browser calls go to `NEXT_PUBLIC_API_URL=/railway-proxy`, which
`app/railway-proxy/[[...path]]/route.ts` forwards to `API_PROXY_TARGET` with the
httpOnly `auth_token` cookie as the Bearer token. Backend source and docs live
in `../khi_backend` (`docs/external` = public reads, `docs/internal` = admin
writes).

**Exception — multipart uploads go direct to the backend.** Vercel drops any
request whose body exceeds 4.5MB (`FUNCTION_PAYLOAD_TOO_LARGE`) before the
proxy function can run, and the cap cannot be raised. The axios interceptor in
`lib/axios.ts` therefore sends every `FormData` request straight to
`NEXT_PUBLIC_API_DIRECT_URL` (the backend origin) with a `Bearer` token —
from the auth store, or recovered via `GET /api/auth/session` after a page
refresh. This needs the dashboard's origin in the backend's
`app.cors.allowed-origins` (see `../khi_backend/src/main/resources/application.yaml`,
which allows up to 1GB multipart). When `NEXT_PUBLIC_API_DIRECT_URL` is unset,
everything stays on the proxy. `connect-src` in `lib/csp.ts` includes that
origin, otherwise the CSP would block the direct upload.

- **Site fonts**: `site_fonts` rows form a per-language library
  (`GET/POST/DELETE /api/v1/site-fonts`); `site_settings.ckbFontName/Url` /
  `kmrFontName/Url` hold the *activated* font — activation is a normal
  settings PUT from `components/settings/font-library.tsx`, which lives
  outside the branding form (saving branding must never resend font fields or
  it would clobber the activation). Files go through
  `uploadMedia(file, "document")`; the bucket sends no CORS and CSP is
  `font-src 'self'`, so previews load through `app/api/site-font` — a
  host-allowlisted same-origin proxy. The website has its own copy of that
  route and applies the fonts via generated `@font-face` + `--font-app-*`
  overrides.
- **Site colors**: `site_settings` also carries `bodyColor`, `navbarColor`,
  `footerColor`, `collectionColor` — hex strings edited on the branding form
  (native color picker + hex box, reset = clear to ""). The website maps them
  onto `--color-background`, `--site-header-bg`, `--site-footer-bg`,
  `--site-collection-bg` in injected `:root` overrides; unset fields fall back
  to the bundled tokens.

## Backend contracts that shape the forms

Read these before touching a write path — the API is not forgiving.

- **`PUT /api/v1/about/{id}` is a full replace.** Every field except `active`
  and `displayOrder` is overwritten from the request; omitting `kmrContent`,
  `stats`, `slugKmr` or the founder fields blanks them. Always build the
  payload from the freshest `AboutDto` plus the narrow slice being edited
  (`aboutPatchToPayload` in `lib/about-page-data.ts`).
- **`GET /api/v1/about` returns active records only** and there is no
  admin-all counterpart. Deactivating an About page from the dashboard hides
  it from the dashboard, after which the editor sees "no record" and the next
  save creates a duplicate. Do not expose an `active` toggle on About, and do
  not send `active` on About updates (null preserves it).
- **About needs at least one non-blank title** across `ckbContent` /
  `kmrContent`, otherwise `400 BAD_REQUEST` with a generic message.
- **`PUT /api/v1/services/{id}` rewrites `contents` wholesale**, so
  `contents[].id` is not stable across a save — never use it as a React key.
  A `contents` array that is empty is *accepted*, producing a nameless
  section; block that in the editor.
- **Service paths take no trailing slash** (`POST /api/v1/services`, not
  `/services/`): Spring 6 no longer matches a trailing slash.
- Services reads are Redis-cached for 10 minutes, but every write evicts the
  whole `services` cache, so the dashboard does not need to work around it.
  About is not cached at all.
- Error bodies are generic. Key UI messages off `status` + `code` + `details`,
  not `message`.
- **`PUT /api/v1/contact/{id}` is a full replace** like About: omitting
  `ckbContent`, `mapEmbedUrl`, `officeType`, badges, etc. blanks them
  (`active`/`displayOrder` alone are preserved when null). The payload builder
  is `contactFormValuesToPayload` in `lib/contact-form-data.ts`.
- **`GET /api/v1/contact` (admin) answers a flat array**, but
  `GET /api/v1/contact/active` (public) answers a Spring page — the admin
  matcher is the exact literal path, so only the bare collection is protected.
  `slugCkb`, `phone` and `email` are `@NotBlank` (`email` is `@Email`), and
  `slugCkb`/`slugKmr` must differ and be unique.
- **Contact messages are read + status only**: `GET /contact/messages` and
  `PATCH /contact/messages/{id}/status` with `{ "status": "…" }` — there is no
  delete and no per-message GET. `status` shares `SUBMISSION_STATUSES` with
  donations, so the donations status pill/select are reused.
- **`mapEmbedUrl` may contain a pasted `<iframe>` tag**, not a URL — extract
  `src` before rendering (see `embedSrc` in `contact-page-preview.tsx`).
- **Writings create/update are multipart** (`data` JSON blob + file parts
  `ckbCoverImage`/`kmrCoverImage`/`hoverCoverImage`/`ckbBookFile`/`kmrBookFile`),
  and the `data` blob **rejects unknown fields** with
  `400 Unrecognized field "…"`. `PUT` is a *partial merge* — null means
  "unchanged", not "clear". `seriesId` exists only on the create contract;
  never send it on update. `clearTopic: true` is the only way to detach a
  topic (`topicId: null` alone is a no-op), and `parentBookId` can re-link but
  never un-link (no way to detach a book from its parent). A declared
  `contentLanguages` entry must carry a non-blank title — enforced in
  `lib/validations/writings.ts` before the request leaves.
- **`PUT /api/v1/image-collections/{id}` is multipart-only** — a JSON body
  answers `500 INTERNAL_ERROR` (unmapped `HttpMediaTypeNotSupportedException`),
  so every edit goes through `updateCollectionMultipart`, even text-only ones.
  Only create has a `/json` route. The PUT is a partial merge where `""` still
  overwrites, so the edit payload omits blank content keys
  (`editContentPayload` in `lib/image-collections-form-data.ts`). The backend
  pairs the i-th `images` part with `imageAlbum[i]`, so items carrying a
  staged file must lead the array — `orderedAlbumItems` partitions them first
  and `sortOrder` carries the original form position.
- **Upload progress**: every multipart/upload service call accepts an
  `onProgress` (0–100) callback via `toUploadProgress` in `lib/axios.ts`; the
  shared bar is `components/shared/upload-progress-line.tsx`. Staged-file
  forms (writings, videos, sounds, collections) show it in the save footer;
  direct uploads (covers, tiptap toolbar inserts, service gallery) show it
  inline.

## Form conventions

- `hooks/use-server-form-sync.ts` re-seeds a react-hook-form from the server
  record whenever `id:updatedAt` changes and the form is not dirty. Use it
  instead of a one-shot `bootstrapped` ref, which freezes a card on its
  mount-time snapshot and sends stale data back to the destructive PUTs.
- When a registered field name follows a language tab
  (`register(activeLang === "CKB" ? "titleCkb" : "titleKmr")`), the input
  **must** carry `key={fieldName}`. react-hook-form only writes a value into
  an input when it attaches to a new element, so without the remount the field
  keeps the other language's text and overwrites it on the next keystroke.
- Bilingual payload builders must be driven by what was typed, not by a
  `contentLanguages` flag derived from what the record already had — that is
  how a Sorani-only record became impossible to translate.
