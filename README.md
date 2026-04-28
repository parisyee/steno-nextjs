# steno-nextjs

Web client for the [Steno](../steno-cloud) transcription system. Upload audio or video from the browser, browse the transcription history, and run full-text search against the backend's Postgres index.

Sibling to `steno-ios` and `steno-cloud` in the `parisyee/steno` org. For cloud provisioning (GCP, Supabase, IAM, secrets) see [`steno-cloud/INFRASTRUCTURE.md`](../steno-cloud/INFRASTRUCTURE.md).

## How it fits in

```
Browser ──────► Next.js route handlers (/api/*)
                       │  (adds Authorization: Bearer STENO_API_KEY)
                       │  (streams body straight through; no buffering)
                       ▼
              Steno Cloud Run API ──► Gemini + Supabase
```

The `STENO_API_KEY` bearer token is held server-side and never shipped to the browser. All client calls go through `/api/transcribe`, `/api/transcriptions`, and `/api/search`, which proxy to the Cloud Run backend.

The `/api/transcribe` proxy pipes `request.body` directly into the upstream fetch with `duplex: "half"` so multi-GB uploads don't get buffered in the Next.js process. The upload cap is 2 GB (Gemini's File API limit), enforced both client-side in [`UploadCard`](src/components/UploadCard.tsx) and via `Content-Length` in the proxy route.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 + shadcn/ui (Radix primitives, lucide icons)
- `sonner` for toasts

## Local development

### Requirements
- Node.js >= 20.9 (Next.js 16 requirement)
- npm

### Setup

```bash
npm install
cp .env.example .env.local
# fill in STENO_API_KEY in .env.local
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Name | Required | Description |
|---|---|---|
| `STENO_API_URL` | yes | Base URL of the Steno API (e.g. `https://steno-836899141951.us-central1.run.app`) |
| `STENO_API_KEY` | yes* | Bearer token. Optional only if the backend was started with `STENO_API_KEY` unset. |

Both are read in `src/lib/server.ts` and used exclusively by the route handlers under `src/app/api/`.

## Project layout

```
src/
├── app/
│   ├── layout.tsx            # root layout + <Toaster/>
│   ├── page.tsx              # main screen (upload + list + search)
│   └── api/
│       ├── transcribe/route.ts       # POST proxy (streams body to upstream, up to 2 GB)
│       ├── transcriptions/route.ts   # GET proxy
│       └── search/route.ts           # GET proxy
├── components/
│   ├── UploadCard.tsx        # drop target + file picker
│   ├── TranscriptionList.tsx
│   ├── TranscriptionItem.tsx # row with expand + copy
│   ├── SearchBar.tsx         # debounced query
│   └── ui/                   # shadcn primitives
├── lib/
│   ├── api.ts                # client → /api/* wrappers
│   ├── server.ts             # stenoFetch helper (server-only)
│   └── utils.ts              # cn()
└── types/
    └── transcription.ts      # shared types matching backend JSON
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Out of scope (for now)

- Delete transcription (the backend doesn't expose a `DELETE` endpoint)
- Per-user auth (the backend is single-token)
- In-browser recording (iOS still uses the Voice Memos share flow)
- Deployment config (decide once local is working)
