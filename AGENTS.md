# AGENTS.md

Conventions for AI agents (and humans) in this repo. Read before writing code — it
encodes the non-obvious decisions so you don't re-derive them from the tree. Machine-
specific infra and secrets live in the local, gitignored `CLAUDE.md`, not here.

Stack: Next.js (App Router) · React · Prisma/Postgres · zod · Biome · Jest · Bun · MinIO/S3.

## Layout

- `server/<domain>/` — one folder per entity (barometers, brands, documents, …):
  - `actions.ts` — mutations (server actions)
  - `queries.ts` — reads (cached)
  - `schemas.ts` — zod schemas for action input
  - `__tests__/` — jest
  - Copy `server/barometers/` as the template for a new domain.
- `server/files/` is **server-only**: MinIO driver (`storage.ts`), RPC (`actions.ts`),
  persistence (`images.ts`, `pdfs.ts`). Client code never lives under `server/` — the
  Uppy upload transport is in `utils/upload.ts`.

## Server actions (mutations)

- `server/<domain>/actions.ts`, first line `'use server'`.
- First statement on every admin entry point: `await requireAdmin()`.
- Validate raw input with `Schema.parse(rawData)` (`unknown` in). Schemas live in `schemas.ts`.
- Return `ActionResult<T>` (`types/next.ts`): `{ success, data } | { success, error }`.
  Catch Prisma `P2002` for friendly unique-constraint messages.
- After a successful write, invalidate caches with `updateTag(Tag.X)` (`constants/tags.ts`).
  (Some older code uses `revalidateTag`; prefer `updateTag`.)
- Do side-effects (file moves, image rows) **inside the action**, atomically with the
  entity write — use a nested Prisma `create`, not separate calls.

## Form → action flow (the important one)

Client form → zod validation+transform schema → server action `Schema.parse` → Prisma.

**Never run persistence or storage side-effects inside a client zod `.transform()`.**
Transforms execute on the client: they break atomicity/idempotency and orphan data on
partial failure. A transform only reshapes form data into the action's input (e.g. pass
temp upload refs as `MediaFile[]`); the **action** persists. See `createBarometer` /
`updateBarometer` in `server/barometers/actions.ts`.

## `'use server'` boundary

- `'use server'` marks RPC entry points callable from the client; every export becomes a
  serializable server action over the wire.
- Internal server helpers (not called from the client) are **plain modules**, no directive
  — e.g. `server/files/images.ts` (`saveTempImages`, `createBlurData`). Don't add
  `'use server'` just to share code between server modules.

## Queries (reads)

- `server/<domain>/queries.ts`; fetchers start with `'use cache'` and tag with `Tag.*` so
  `updateTag` invalidates them. Manual DB edits (Prisma Studio / raw SQL) bypass this →
  expect stale data until the next invalidation or build.

## Tests

- Co-located in `server/<domain>/__tests__/*.test.ts`, `@jest-environment node` for server code.
- Mock Prisma / auth / storage / minio / next via `server/testing/mocks.ts`
  (`jest.mock(..., () => require('../../testing/mocks').xModule)`); assert with
  `expect.objectContaining`.
- Keep pure logic in import-light modules so node tests don't pull browser-only deps —
  e.g. `utils/upload-helpers.ts` is split from `utils/upload.ts` (which imports Uppy/compressorjs).

## Before committing

`bun run lint && bun run typecheck && bun run jest` must pass. A pre-commit hook
(lint-staged: Biome check/format + related Jest, then `tsc`) enforces it — don't bypass.

## Gotchas

- DB scripts hit **local** unless run via `scripts/tunnel.ts`; never `prisma migrate dev`
  against prod (see local `CLAUDE.md` / `.docs/`).
- `Image` ↔ entity relations are many-to-many; replacing an entity's image set uses
  `{ deleteMany: {}, create: [...] }`.
- `master` auto-deploys to production on push (Coolify, ~5 min).
