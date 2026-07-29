# KHI Dashboard

Admin dashboard for managing KHI website content — news, projects, writings, sounds, videos, image collections, services, donations and contact entries.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and shadcn/ui. The interface is Kurdish Sorani (`ckb`) and renders right-to-left.

## Requirements

- Node.js 22+
- pnpm 10 (`corepack enable`)
- Access to a running KHI backend API

## Setup

```bash
cp .env.example .env.local
```

Fill in `.env.local` — see the comments in `.env.example` for what each variable does. At minimum you need `API_PROXY_TARGET` pointing at the backend.

```bash
pnpm install
pnpm dev
```

The app runs at http://localhost:3000 and redirects to `/login`.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve a production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier over all `.ts`/`.tsx` |

## How requests reach the API

The browser never calls the backend directly. `NEXT_PUBLIC_API_URL` is set to `/railway-proxy`, a catch-all route handler (`app/railway-proxy/[[...path]]/route.ts`) that forwards to `API_PROXY_TARGET`.

This buys three things: no CORS configuration, the correct `Host` header upstream, and authentication via an httpOnly cookie instead of a browser-readable token.

**Authentication.** On login the JWT is written to an httpOnly `auth_token` cookie (`app/api/auth/session/route.ts`). The proxy reads that cookie and attaches it as a `Bearer` header on every upstream request. The token is deliberately *not* persisted to `localStorage` — only its expiry timestamp is, so the session guard can still log the user out on time after a page refresh. `proxy.ts` gates every route on the cookie's presence at the edge.

## Deployment

Build the image, passing the `NEXT_PUBLIC_*` values as build args — they are inlined into the client bundle at build time and cannot be changed afterwards without rebuilding:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=/railway-proxy --build-arg NEXT_PUBLIC_SITE_URL=https://khi.krd --build-arg NEXT_PUBLIC_SITE_LABEL=KHI -t khi-dashboard .
```

Run it, passing the server-side variable at runtime:

```bash
docker run -p 3000:3000 -e API_PROXY_TARGET=https://your-api.example.com khi-dashboard
```

### Reverse proxy configuration

Media uploads run up to **500 MB** (video). The proxy route streams request bodies rather than buffering them, but whatever sits in front of the container must be configured to allow bodies that large — nginx defaults `client_max_body_size` to **1 MB** and will reject every upload with a 413:

```nginx
client_max_body_size 512M;
proxy_request_buffering off;
```

Terminate TLS at the reverse proxy. The auth cookie is set with `secure` in production, so the app must be served over HTTPS or login will not persist.

## Project layout

```
app/              App Router routes; all dashboard pages live under /dashboard
components/       Feature folders (news, projects, sounds, …) + ui/ primitives
hooks/            React Query hooks, one module per domain
services/         API clients, one module per domain
lib/              Query keys, form-data builders, normalizers, validation
types/            API DTOs and UI-facing types
messages/         next-intl message catalogue (ckb)
proxy.ts          Edge auth gate (Next 16's renamed middleware)
```

Rich text from the API is rendered through `lib/sanitize-news-html.ts`, which runs DOMPurify with an explicit tag and attribute allowlist. Any new `dangerouslySetInnerHTML` call site must go through it.
