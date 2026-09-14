# khi-dashboard — working notes

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
