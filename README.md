# SpecFinder

Building professionals do not shop for products - they discharge obligations. SpecFinder is a **requirement-led specification finder** for the fictional Aurelith building materials catalogue: set fire, acoustic, and exposure requirements, get the leanest compliant options, and export a specification - no prices, no cart.

## Live demo

Deploy locally (see [Quickstart](#quickstart)). Production target:

- **App:** Vercel - `apps/web` (Next.js app + Route Handlers + JSON seed)

## Quickstart

**Prerequisites:** Node 20+, pnpm 10+

```bash
pnpm install
pnpm --filter @specfinder/shared build
pnpm dev
```

- App: http://localhost:3000
- API routes: http://localhost:3000/api

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e   # starts the Next.js dev server automatically
```

## Investigation

Knauf Digital builds software for a building materials group whose purchase cycle is specification-led: architects name systems in tender documents (_Leistungsverzeichnis_); contractors must supply those products. Real Knauf pages carry no prices - the outcome is enquiry and specification, not checkout.

**Primary user - specifier:** desktop, needs performance data, standards, and lean compliance (over-specification costs the client).

**Secondary user - installer:** mobile, searches by **material number**, needs weights and pallet data.

Competitor patterns (e.g. Rigips/Systemfinder-style tools) favour requirement input over category browsing. SpecFinder mirrors that: threshold filters (`fireMin=60` returns EI 60, 90, 120), least-over-specification ranking, and export.

Sources consulted: [EN 520](https://www.en-standard.eu/) gypsum board types, [EN 13501-1](https://www.en-standard.eu/) reaction to fire, public Knauf/Rigips product page structures (not copied).

## Product decisions

| Decision                       | Rationale                                           |
| ------------------------------ | --------------------------------------------------- |
| Requirement-led, not catalogue | Matches how specifications are written              |
| Threshold filters              | `>=` semantics for fire and Rw                      |
| Muted “exceeds” styling        | Over-specification is not rewarded                  |
| No prices / cart               | Wrong model for this industry                       |
| “Add to specification”         | Terminal action completes the job                   |
| Face-paper colour coding       | Industry convention (pink = fire, green = moisture) |

## Architecture

```
Browser → Next.js (apps/web) → Route Handlers → JSON seed
                            ↘ packages/shared (Zod)
```

Product data lives in `apps/web/data/products.seed.json` behind a repository interface (`lib/products/products.repository.ts`) designed as a future PIM swap point. Filtering and match reasoning run server-side to scale beyond the 40-product seed.

## Data and sources

- **Brand:** Aurelith (fictional - no Knauf trademarks)
- **40 products** with realistic EN-style fields, invented names and material numbers
- **Edge cases:** null fire ratings, missing EPDs, single-variant and seven-variant products
- **Images:** inline SVG placeholders tinted by face paper

Limitations: product-level only (not full wall assemblies W111/W112); documents and BIM/CAD are stubbed.

## Scope

**In v1:** product list, search (incl. material numbers), threshold filters, detail page, match reasoning, compare (3), specification list + export, URL-synced state.

**Out of v1:** pricing, auth, i18n, live PIM, real BIM downloads, system-level assembly config - documented here and in [DECISIONS.md](./DECISIONS.md).

## Accessibility

- Skip link, visible focus rings (shadcn defaults), `aria-live` result counts
- Filter groups use `fieldset`/`legend`; slider exposes `aria-valuetext`
- Face-paper colours always paired with text labels
- `prefers-reduced-motion` respected in CSS
- Mobile controls ≥ 44px where specified (filter trigger, specification button)

**Contrast (WCAG AA):**

| Pair                                   | Ratio  | Pass                           |
| -------------------------------------- | ------ | ------------------------------ |
| `--primary` (#0077A8) on white         | 4.9:1  | AA body                        |
| `--ink-muted` (#5B6167) on `--surface` | 5.9:1  | AA body                        |
| Knauf cyan `#009FE3` on white          | ~2.6:1 | Fails AA - display/accent only |

Run axe DevTools on `/products` and `/products/[slug]` before submission.

## Testing

| Layer | Coverage                                                   |
| ----- | ---------------------------------------------------------- |
| Unit  | `ranking.ts`, `format.ts`, `query-params.ts`, document generator |
| E2E   | Playwright - filter journey, material search, mobile sheet |

Not covered: visual regression, load testing, real PIM integration.

## What I would do next

1. System-level assemblies (fire/acoustic as build-up properties)
2. Regional assortment and i18n (data model is locale-ready)
3. Real PIM + document CDN
4. BIM/IFC export via existing integration seam

## AI usage

AI assisted research, scaffolding, component wiring, seed generation, and documentation. All code was reviewed, typed, linted, and tested locally before submission.

## Deploy (manual)

**Vercel (`apps/web`):** import the repo, set root directory to `apps/web`, deploy. No extra environment variables are required unless you override the default `/api` base path with `NEXT_PUBLIC_API_URL`.

![CI](https://github.com/YOUR_ORG/specfinder/actions/workflows/ci.yml/badge.svg)
