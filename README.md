# Serendipity UX

The Serendipity **app** — every screen, flow, and piece of product logic — and the single deployable of the Serendipity-HQ organization. Connect **this repo** to Vercel; the whole org ships on its one deploy link.

## How the org fits together

| Repo | Owns | PRs about |
|---|---|---|
| [Serendipity-Design](https://github.com/Serendipity-HQ/Serendipity-Design) | Theme tokens, global CSS, shared types, product vocabulary | Palette, tokens, typography, type changes |
| [Serendipity-UI](https://github.com/Serendipity-HQ/Serendipity-UI) | Reusable components (cards, nav, badges, guest list, reveal) | Component visuals & interactions |
| **Serendipity-UX** (this repo) | Pages, flows, state (`AppContext`), Supabase, API routes | Screens, journeys, product behavior |

Design and UI are consumed as git dependencies (`github:Serendipity-HQ/…`) and transpiled by Next.js (`transpilePackages`). The dependency direction is one-way: **Design ← UI ← UX**.

## Development

```bash
npm install
npm run dev
```

Auth, wallet, bookings, and the journal are a localStorage prototype. Experience data comes from Supabase when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, with a mock-data fallback otherwise.

## Shipping a change from Design or UI

Merging a PR in Design/UI does **not** redeploy the app by itself — the app pins those packages to a commit in `package-lock.json`. To pick up and ship their latest `main`:

```bash
npm update @serendipity-hq/design @serendipity-hq/ui
git commit -am "Bump design/ui packages" && git push
```

That push triggers the Vercel deploy. (Both packages are public, so Vercel needs no extra credentials to install them.)
