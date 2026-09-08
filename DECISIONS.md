# Architecture decisions - SpecFinder

## 1. Requirement-led model over catalogue browse

**Context:** Assignment asks for search/filter; industry buys via specification.  
**Decision:** Frame filters as project requirements; rank by fit, not alphabet.  
**Alternatives:** Category-first catalogue (rejected - matches DIY e-commerce).  
**Consequences:** More domain copy; clearer PO alignment.

## 2. Threshold semantics for numeric filters

**Context:** Fire and Rw are minimum requirements in tenders.  
**Decision:** `fireMin=60` returns 60, 90, 120; store performance as numbers.  
**Alternatives:** Equality filters (rejected - unusable for specifiers).  
**Consequences:** Requires numeric schema; enables ranking.

## 3. Least-over-specification ranking

**Context:** Over-specified walls cost clients money.  
**Decision:** Score = 1 − mean(normalised excess); tie-break variants then name.  
**Alternatives:** Sort by highest fire/Rw (rejected - rewards over-spec).  
**Consequences:** Heavily unit-tested; “exceeds” styled muted in UI.

## 4. Next.js Route Handlers (consolidated backend)

**Context:** Prototype size (40 products, JSON seed) does not need a separate service or deploy target.  
**Decision:** Product filtering, ranking, facets, compare, and document preview run in Next.js Route Handlers under `apps/web/app/api`.  
**Alternatives:** Separate Nest API (original take-home layout; removed to simplify Vercel-only deploy).  
**Consequences:** Single deploy; repository/service layering kept in `apps/web/lib/products` for a future PIM swap.

## 5. Server-side filtering at prototype scale

**Context:** 40 products could filter client-side.  
**Decision:** Filter/rank in the Next.js Route Handler service layer anyway.  
**Alternatives:** Client-side for speed.  
**Consequences:** API contract ready for 10k SKUs; slight latency (400ms dev shim).

## 6. Product / variant separation

**Context:** Installers search material numbers; one product has many SKUs.  
**Decision:** `variants[]` with `materialNumber` per row.  
**Alternatives:** Flattened product list (rejected - loses installer workflow).  
**Consequences:** Slightly richer UI (variants table).

## 7. JSON seed over database

**Context:** Take-home prototype, no auth.  
**Decision:** Validated JSON + repository interface.  
**Alternatives:** SQLite/Postgres.  
**Consequences:** Easy clone; swap `ProductsRepository` for PIM later.

## 8. Fictional Aurelith brand

**Context:** Must not copy Knauf trademarks or protected copy.  
**Decision:** Invented brand with realistic EN-style fields.  
**Alternatives:** Anonymous “Product A” (rejected - weak domain signal).  
**Consequences:** README cites public standards, not proprietary sheets.

## 9. No localStorage

**Context:** Preview environments may block storage APIs.  
**Decision:** Specification list in React state; compare slugs in URL via nuqs.  
**Alternatives:** localStorage persistence.  
**Consequences:** Spec list lost on refresh - acceptable for v1.

## 10. shadcn radix-vega (not legacy “New York”)

**Context:** shadcn CLI v4 renamed styles to `{library}-{style}` presets.  
**Decision:** `radix-vega` - direct successor to New York.  
**Alternatives:** `base-nova` default (different primitive API).  
**Consequences:** Documented in README; custom tokens in `globals.css`.

## 11. TypeScript 5.9 pinned (not TS 7)

**Context:** Nest relies on `experimentalDecorators`.  
**Decision:** Pin `~5.9` workspace-wide.  
**Alternatives:** Latest TS 7 Go port.  
**Consequences:** Stable Nest builds.

---

## Questions I would have asked a Product Owner

1. When specifier and installer needs conflict, which persona wins for v1?
2. Are system assemblies (W111/W112) in scope, or product-level only?
3. Should over-specified products be hidden or shown and demoted?
4. Is regional availability / country assortment required on cards?
5. Do we need logged-in projects, or is URL-sharing enough for colleagues?
6. Which export formats do contractors actually accept (GAEB, CSV, PDF)?
7. Should compare include variant-level rows or product-level only?
8. Is EPD mandatory for public-sector tenders in target markets?
