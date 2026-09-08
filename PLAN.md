# SpecFinder - Build Plan

> **For the AI agent reading this:** This is the complete specification for a take-home assignment. Read the whole file before writing code. Build in the phase order given at the end. Do not add features that are not in scope. When a decision is ambiguous, choose the option that is simpler to maintain, and record the decision in `DECISIONS.md`.

---

## 1. Context

**The assignment.** A building materials company wants to improve how people discover and understand its products. Build a web app where a user can view a list of products, search them, filter them, and open one to see detail. The evaluator cares as much about investigation, scoping and communication as about the code.

**The company.** Knauf Digital GmbH (Munich) - the software subsidiary of Knauf Group, a family-owned German building materials manufacturer (founded 1932; gypsum boards, insulation, ceiling systems; ~43,500 employees in 90 countries). Their stated stack for this role is **TypeScript - React, Next.js, Nest.js**. The JD emphasises clean, well-documented, testable code and collaboration with a Product Owner.

**What makes this domain different from e-commerce.** In building materials the purchase decision is made months before money moves. An architect writes a system into the tender document (_Leistungsverzeichnis_); the contractor is then contractually obliged to buy it. Whoever gets named wins. Knauf's real product pages carry **no prices and no cart** - the call to action is "Enquire Now." Their entire tool ecosystem (Systemfinder, Planner Suite, Ausschreibungscenter, BIM plug-ins) funnels toward one outcome: getting their system named in a specification.

**Therefore the product thesis:**

> Building professionals don't shop for products - they discharge obligations. They arrive with a requirement ("EI 90 fire resistance, Rw ≥ 54 dB, wet room") and need the leanest compliant option plus the paperwork to defend it. So this is a **requirement-led specification finder**, not a catalogue.

**Hard rule:** no prices, no cart, no "Add to basket" anywhere in this app. The terminal action is **Add to specification**.

---

## 2. Users

**Primary - Specifier (architect / planner).** Desktop, in an office, mid-design-phase. Job: _"Prove this assembly meets EI 90 and Rw ≥ 54 dB, and give me the documents."_ Researches independently; wants performance data, standards, certifications, EPDs. Optimises for _not over-specifying_ - a wall that exceeds requirements costs the client money.

**Secondary - Contractor / installer.** Mobile, on site, gloves, poor signal, urgent. Job: _"I know the system, I need the material number, sheet weight and pieces per pallet."_ **Searches by material number, not by marketing name.** This single fact must shape the search implementation.

Explicitly **not** designed for in v1: distributors, sustainability consultants, DIY consumers.

---

## 3. Scope

### In scope (v1)

| #   | Capability                                               | Why it earns its place                                     |
| --- | -------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | Product list, ranked by fit                              | Assignment requirement                                     |
| 2   | Search across name, description, **and material number** | Assignment requirement + how installers actually search    |
| 3   | Requirement filters using **threshold logic**            | Assignment requirement, upgraded to match the domain       |
| 4   | Product detail page as evidence                          | Assignment requirement                                     |
| 5   | "Why this matches" reasoning on each result              | Turns filtering into a defensible argument                 |
| 6   | Compare up to 3 products                                 | The clearest gap in every competitor tool                  |
| 7   | Specification list + export                              | Completes the job instead of just browsing                 |
| 8   | URL-synced state                                         | Specs get shared between colleagues; this is a domain need |

### Out of scope - build none of this, but document each cut in the README

- Pricing, cart, checkout - **wrong business model for this industry**
- User accounts, auth, saved projects - no auth in a prototype
- Internationalisation - note that the data model is locale-ready (they ship in 90 countries) but do not implement it
- Real BIM/CAD/IFC downloads - stub the buttons, explain the integration seam
- Live PIM/ERP integration - JSON seed instead, behind an interface designed for replacement
- **System-level assembly configuration (W111/W112/W115 etc.)** - this is the most important cut. In reality, fire and acoustic ratings are properties of the _whole build-up_, not a single board. v1 scopes to product level. Say this explicitly; it proves domain understanding rather than hiding a gap.

---

## 4. Design direction

The client has rejected anything that reads as a template. Every token below is derived from the subject, not from a default palette.

### 4.1 The signature: face-paper colour coding

**This is the one memorable idea. Everything else stays quiet around it.**

On a real building site, plasterboard is identified by the colour of its paper face: **pink means fire-rated, green means moisture-resistant, ivory means standard.** Tradespeople read the stack from across the room without touching a label. The interface reuses that exact code - performance categories are coloured with the face paper of the board they describe.

This means the colour system is not decoration; it is the industry's own existing convention, carried into software. Every fire-rated result carries a pink marker, every moisture-resistant one green. A specifier scanning results recognises the code instantly because they already use it on site.

Implement as `--face-fire`, `--face-moisture`, `--face-standard`, `--face-impact`. Use on: performance badges, the left rule of a product card, and the compare table header row. **Nowhere else.**

### 4.2 Palette

```css
/* Substrate - gypsum board paper, cool not cream */
--surface: #fbfbfa; /* page background */
--surface-raised: #ffffff; /* cards, panels */
--surface-sunken: #f1f2f0; /* table zebra, disabled fields */

/* Ink */
--ink: #16191c; /* primary text */
--ink-muted: #5b6167; /* labels, captions - 5.9:1 on --surface, AA pass */
--rule: #dfe1de; /* hairlines, borders */

/* Action - derived from Knauf cyan #009FE3, darkened for contrast compliance */
--primary: #0077a8; /* 4.9:1 on white - AA pass for body text */
--primary-hover: #005e86;
--primary-tint: #e8f4f9; /* selected filter chip background */

/* Face paper codes - the signature */
--face-fire: #d6336c; /* pink face = fire-rated board */
--face-moisture: #2f9e68; /* green face = moisture-resistant board */
--face-standard: #b8a88a; /* ivory face = standard board */
--face-impact: #4c5a6b; /* grey/blue = impact-resistant */

/* Semantic */
--meets: #0077a8; /* requirement satisfied exactly */
--exceeds: #5b6167; /* over-specified - deliberately muted, not celebrated */
--danger: #c0392b;
```

> **Accessibility note to carry into the README:** Knauf's brand cyan `#009FE3` measures roughly 2.6:1 on white and fails WCAG AA for body text. It is retained for large display type and non-text accents only; `--primary` is a darkened derivative that passes AA. Catching and documenting this is part of the deliverable.

**Design decision worth stating:** _exceeds_ is rendered **more muted** than _meets_. Over-specification costs the client money. The interface should not reward it with a brighter colour. This inverts the usual "more is better" instinct and is directly grounded in how the industry buys.

### 4.3 Typography

Three roles, chosen for industrial-technical heritage rather than neutrality.

| Role    | Face                                                   | Usage                                                                           |
| ------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Display | **Archivo** (variable, tighten width axis on headings) | Page titles, product names, section headers. Weight 600–700, tracking `-0.02em` |
| Body    | **IBM Plex Sans**                                      | All prose, labels, buttons, descriptions                                        |
| Data    | **IBM Plex Mono**                                      | Material numbers, dimensions, dB values, EI ratings, λ values, file sizes       |

IBM Plex was drawn for an engineering company and reads as technical documentation rather than as a startup landing page. Archivo's width axis lets headings compress like a printed datasheet header.

**Non-negotiable:** every numeric spec value uses `font-variant-numeric: tabular-nums`. Columns of dimensions must align. This is two lines of CSS and it is the difference between "looks like a demo" and "looks typeset by someone who has read a technical datasheet."

Type scale (1.25 ratio): `12 / 14 / 16 / 20 / 25 / 31 / 39`px.

### 4.4 Layout and structural language

- **Border radius: 4px maximum.** Crisp and technical. Rounded corners read consumer; this audience reads section drawings.
- **Hairline rules over shadows.** Use `1px solid var(--rule)` for separation. Reserve shadow for genuinely floating layers only (Sheet, Dialog, Popover).
- **Dense but breathable.** 8px spacing base. Product cards are compact - a specifier scans twenty options, they don't admire four.
- **Eyebrow labels** in `IBM Plex Mono`, uppercase, 12px, `--ink-muted`, letter-spacing `0.08em` - reading as datasheet field labels ("FIELD OF APPLICATION", "MATERIAL NO."). Structural, not decorative: they only appear where the content genuinely is a labelled data field.
- **No numbered step markers (01/02/03)** anywhere. Nothing in this product is a sequence.

### 4.5 Motion

Restrained to three moments, all under 200ms, all respecting `prefers-reduced-motion`:

1. Filter chips animating in/out as requirements change
2. Specification Sheet sliding from the right
3. Result cards cross-fading on filter change (opacity only, no layout shift)

No scroll-triggered reveals. No ambient animation. This is a working tool.

### 4.6 Copy rules

- Errors state what happened and what to do. They never apologise and are never vague.
- Empty states are directive: _"No products meet Rw ≥ 60 dB with EI 90. Try lowering the acoustic requirement to 54 dB."_ - name the specific constraint to relax.
- Buttons name the outcome and keep the same name throughout: `Add to specification` → toast reads `Added to specification`.
- Jargon gets a `Tooltip` on first use per page: EI, Rw, λ, H2/H3, DoP, EPD. Define it in one plain sentence.
- Sentence case everywhere except mono eyebrow labels.

---

## 5. Architecture

### 5.1 Stack

| Layer            | Choice                                                                           |
| ---------------- | -------------------------------------------------------------------------------- |
| Language         | TypeScript, `strict: true`                                                       |
| Frontend         | Next.js 15+ App Router                                                           |
| Backend          | Nest.js, REST                                                                    |
| UI               | shadcn/ui (New York style) + Tailwind - **use shadcn components for everything** |
| Validation       | Zod - one schema validates both seed data and query params                       |
| Server state     | TanStack Query                                                                   |
| URL state        | `nuqs`                                                                           |
| Icons            | lucide-react                                                                     |
| Unit/integration | Vitest + React Testing Library                                                   |
| E2E              | Playwright                                                                       |
| Tooling          | pnpm workspaces, ESLint, Prettier, Husky, GitHub Actions                         |

**Why a separate Nest API rather than Next Route Handlers:** it matches the team's stack, forces a clean DTO/service boundary, and models the real architecture where a PIM sits behind the API. Record the honest caveat in `DECISIONS.md`: _for a prototype this size, Route Handlers would be sufficient; Nest was chosen to demonstrate layering and match the team's stack._

**Filtering and ranking run server-side**, in the Nest service layer - even though 40 products could be filtered in the browser. State in the README that this is so the design scales to 10,000 SKUs.

### 5.2 Repo structure

```
specfinder/
├── apps/
│   ├── web/                       # Next.js
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # → redirect to /products
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                # list + filters (SSR)
│   │   │   │   └── [slug]/page.tsx         # detail (SSR)
│   │   │   ├── compare/page.tsx
│   │   │   ├── error.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── globals.css                 # design tokens live here
│   │   ├── components/
│   │   │   ├── ui/                         # shadcn primitives
│   │   │   ├── filters/
│   │   │   ├── products/
│   │   │   ├── compare/
│   │   │   └── specification/
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── query-params.ts             # Zod ↔ URL serialisation
│   │   │   └── format.ts                   # dimension/unit formatting
│   │   └── hooks/
│   └── api/                       # Nest.js
│       ├── src/
│       │   ├── products/
│       │   │   ├── products.controller.ts
│       │   │   ├── products.service.ts
│       │   │   ├── products.repository.ts  # ← swap point for a real PIM
│       │   │   ├── ranking.ts              # match scoring, unit-tested
│       │   │   └── dto/
│       │   ├── common/
│       │   └── main.ts
│       └── data/products.seed.json
├── packages/
│   └── shared/                    # Zod schemas + types, imported by both apps
├── DECISIONS.md
├── README.md
└── .github/workflows/ci.yml
```

---

## 6. Data model

Defined once in `packages/shared` as Zod schemas; types inferred from them.

```ts
export const MoistureClass = z.enum(['none', 'H2', 'H3']);
export const Application = z.enum(['interior_wall', 'ceiling', 'floor', 'facade']);
export const EdgeProfile = z.enum(['tapered', 'square', 'recessed', 'none']);
export const FacePaper = z.enum(['ivory', 'pink', 'green', 'grey', 'none']);

export const VariantSchema = z.object({
  materialNumber: z.string(), // e.g. "00767843" - installers search this
  widthMm: z.number().int(),
  lengthMm: z.number().int(),
  thicknessMm: z.number(),
  weightKg: z.number(),
  weightPerSqmKg: z.number(),
  piecesPerPallet: z.number().int().nullable(),
  coverageSqm: z.number(),
});

export const DocumentSchema = z.object({
  type: z.enum(['TDS', 'SDS', 'DoP', 'EPD', 'CAD', 'BIM']),
  title: z.string(),
  fileType: z.literal('PDF'),
  sizeKb: z.number(),
  pages: z.number().int().nullable(),
  updatedAt: z.string(), // ISO date
  url: z.string(), // stubbed - no real files
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string(), // short positioning line, e.g. "Fire-resistant, high density"
  description: z.string(),
  category: z.enum([
    'gypsum_board',
    'cement_board',
    'insulation',
    'ceiling_tile',
    'profile',
    'filler',
    'accessory',
  ]),
  family: z.string(), // e.g. "Fire-resistant boards"
  facePaper: FacePaper, // drives the signature colour
  applications: z.array(Application).min(1),
  areaOfApplication: z.enum(['interior', 'exterior', 'both']),

  performance: z.object({
    fireResistanceMin: z.number().int().nullable(), // 0 | 30 | 60 | 90 | 120 - NUMBER, not "EI 90"
    reactionToFireClass: z.string().nullable(), // "A2-s1,d0" per EN 13501-1
    soundReductionRw: z.number().int().nullable(), // dB
    moistureClass: MoistureClass,
    impactResistanceClass: z.string().nullable(),
    thermalConductivity: z.number().nullable(), // W/mK
    maxHeightM: z.number().nullable(),
  }),

  standards: z.array(z.string()), // ["EN 520 Type A", "EN 13501-1"]
  sustainability: z.object({
    recycledContentPct: z.number().nullable(),
    hasEpd: z.boolean(),
  }),
  edgeProfile: EdgeProfile,
  variants: z.array(VariantSchema).min(1),
  documents: z.array(DocumentSchema),
  imageUrl: z.string(), // local placeholder SVG
});
```

**Two modelling rules that must not be broken:**

1. **Performance values are numbers, never strings.** `fireResistanceMin: 90` is comparable; `"EI 90"` is not. Threshold filtering depends on this.
2. **Product ≠ SKU.** One product carries many material numbers across thicknesses and lengths. This mirrors the real catalogue, where a single board product lists a variants-and-packaging table.

### 6.1 Seed data

Generate **40 fictional products** in `apps/api/data/products.seed.json`.

- **Fictional brand: "Aurelith"** - invented manufacturer. Do not use Knauf trademarks, logos or copy.
- Product data is _realistic and modelled on_ publicly published technical structures (thickness ranges 9.5/12.5/15/18/20mm, EI 30/60/90/120, Rw 33–65 dB, EN 520 types, H2/H3 moisture classes), but every product name, material number and figure is invented.
- Distribution: ~18 gypsum boards, 6 cement boards, 6 insulation, 4 ceiling tiles, 3 profiles, 3 fillers/accessories.
- Deliberately include: 3 products with `fireResistanceMin: null` (not fire-rated), 2 with no EPD, 1 with a single variant, 1 with seven variants. These make empty/edge states real rather than theoretical.
- Images: locally generated SVG placeholders tinted by `facePaper`. No external image URLs.

Document all of this in a `## Data and sources` README section, and cite the public technical structures the model is based on.

---

## 7. API contract

```
GET /api/products
GET /api/products/:slug
GET /api/products/compare?slugs=a,b,c        # max 3
GET /api/facets                              # available filter values + counts
```

### `GET /api/products` query parameters

| Param              | Type   | Semantics                                                                              |
| ------------------ | ------ | -------------------------------------------------------------------------------------- |
| `q`                | string | Case-insensitive match on name, tagline, description, **and variant material numbers** |
| `application`      | enum[] | OR within, AND across params                                                           |
| `fireMin`          | int    | **`>=` threshold.** `fireMin=60` returns 60, 90, 120                                   |
| `rwMin`            | int    | **`>=` threshold**                                                                     |
| `moisture`         | enum   | `H2` returns H2 and H3                                                                 |
| `thicknessMax`     | number | Any variant satisfies                                                                  |
| `category`         | enum[] |                                                                                        |
| `sort`             | enum   | `relevance` (default) \| `name_asc` \| `name_desc` \| `fire_desc` \| `rw_desc`         |
| `page`, `pageSize` | int    | Default 1, 12                                                                          |

### Response

```json
{
  "items": [
    {
      "product": {/* ...ProductSchema */},
      "match": {
        "score": 0.92,
        "criteria": [
          {
            "key": "fireResistanceMin",
            "label": "Fire resistance",
            "required": 60,
            "actual": 90,
            "status": "exceeds",
            "unit": "min"
          },
          {
            "key": "soundReductionRw",
            "label": "Sound insulation",
            "required": 50,
            "actual": 50,
            "status": "meets",
            "unit": "dB"
          }
        ]
      }
    }
  ],
  "total": 14,
  "page": 1,
  "pageSize": 12,
  "appliedFilters": { "fireMin": 60, "rwMin": 50 }
}
```

The `match.criteria` array is what renders the "why this matches" strip. **Compute it on the server** - it is business logic, not presentation.

### Ranking algorithm - `ranking.ts`, unit-tested

Products failing any hard requirement are excluded. Among survivors, rank by **least over-specification first**:

```
score = 1 - (normalised total excess across all active numeric criteria)
```

A product that exactly meets EI 60 outranks one delivering EI 120, because the leaner option costs the client less. Tie-break on fewest variants, then alphabetically. **This directly mirrors how the industry actually selects** and is the single most defensible piece of logic in the app - give it thorough tests.

### Error handling

- Invalid query params → `400` with a Zod-derived field-level message; the UI shows which filter was invalid and resets only that one.
- Unknown slug → `404` → Next `not-found.tsx`.
- Simulate 400ms latency in dev so loading states are visible and testable.

---

## 8. Screens

### 8.1 `/products` - Results

**Layout.** Desktop: 280px filter rail left, results right. Mobile: filters in a `Sheet` behind a trigger showing the active filter count.

**Regions, top to bottom:**

1. **Search bar** - `Input` with search icon. Debounced 300ms. Placeholder: `Search products or material number`.
2. **Requirement bar** - the filters, presented as a requirement statement rather than a taxonomy:
   - `ToggleGroup` (multi) - application: Interior wall / Ceiling / Floor / Façade
   - `RadioGroup` - fire resistance: No requirement / EI 30 / EI 60 / EI 90 / EI 120
   - `Slider` - sound insulation `Rw ≥ __ dB`, range 30–65, step 1, live value in mono
   - `Select` - moisture exposure: Dry / Damp (H2) / Wet (H3)
   - `Checkbox` group - category
   - `Accordion` wrapping each group on mobile
3. **Active filter chips** - `Badge` with an X each, individually removable, plus a ghost `Button` "Clear all".
4. **Result header** - `<n> products meet your requirements`, in an `aria-live="polite"` region. Sort `Select` on the right.
5. **Results** - `Card` grid, 3-up desktop / 2-up tablet / 1-up mobile.
6. `Pagination`.

**Product card anatomy** - the compliance strip is the signature:

```
┌─────────────────────────────────────────────┐
│▌ [image]                                    │  ← 3px left rule, --face-* colour
│▌                                            │
│▌ FIRE-RESISTANT BOARDS          ← eyebrow, mono
│▌ Aurelith Ignis 15              ← Archivo 600
│▌ High-density fire-rated core   ← tagline
│▌                                            │
│▌ ┌─ WHY THIS MATCHES ──────────────────┐   │
│▌ │ ✓ EI 90    exceeds your EI 60       │   │  ← --exceeds, muted
│▌ │ ✓ Rw 54 dB meets your ≥ 54 dB       │   │  ← --meets, primary
│▌ │ ✓ H2       meets damp exposure      │   │
│▌ └─────────────────────────────────────┘   │
│▌                                            │
│▌ 15 mm · 1200×2400 · 12.0 kg/m²  ← mono, tabular
│▌ [ View details ]  [ + Specification ]      │
└─────────────────────────────────────────────┘
```

When no requirements are set, the "why this matches" block is replaced by the three headline performance figures. The card never collapses to nothing.

**Acceptance criteria**

- [ ] All filter state serialises to the URL; reload restores it exactly; the URL can be pasted to a colleague
- [ ] `fireMin=60` returns EI 60, 90 _and_ 120 - verified by test
- [ ] Results are ordered least-over-specified first
- [ ] Searching a material number returns its parent product
- [ ] Result count is announced to screen readers on change
- [ ] Every filter is reachable and operable by keyboard alone

### 8.2 `/products/[slug]` - Detail

Server-rendered. Two columns desktop, stacked mobile.

**Left:** `Carousel` of images; certification `Badge` row beneath.

**Right:** eyebrow (family) → `h1` product name → tagline → face-paper indicator → performance summary (three largest figures in mono) → `Button` "Add to specification" (primary) + "Add to compare" (outline) + "Download datasheet" (ghost, stubbed with a toast explaining it is not wired in this prototype).

**Below, `Tabs`:**

| Tab                  | Contents                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical data       | Definition-list of all performance fields + standards. Each unit gets a `Tooltip` defining it                                                   |
| Variants & packaging | `Table`: material number (mono) · width · length · thickness · weight · kg/m² · pcs/pallet. Tabular numerals. `ScrollArea` horizontal on mobile |
| Documents            | `Table`: type badge · title · file type · size · pages · updated. Download stubbed                                                              |
| Sustainability       | Recycled content, EPD availability                                                                                                              |

**Acceptance criteria**

- [ ] Page is server-rendered with correct `<title>` and meta description
- [ ] Unknown slug renders `not-found.tsx`, not a crash
- [ ] Variants table scrolls horizontally on mobile with a visible affordance, or reflows to stacked definition lists below `sm`
- [ ] Every number in the tables uses tabular figures

### 8.3 `/compare`

`Table` with a sticky first column: attribute rows down the left, up to 3 products across. Header cells carry the face-paper colour. Differing values are emphasised; identical values are muted, so the eye lands on what actually differs. Empty state invites adding products from the results page.

### 8.4 Specification list

`Sheet` from the right, trigger in the header with a count badge.

- `ScrollArea` of added items; each removable
- `DropdownMenu` → Export as Markdown / Export as CSV / Print
- Export includes: product name, family, material numbers, key performance figures, applicable standards, and a generated timestamp
- Persisted in React state + URL only. **No `localStorage`** - the app must run inside restricted preview environments
- Empty state: _"No products added yet. Add products from the results list to build a specification."_

**This is the feature that turns a browse into a completed job. Do not cut it.**

---

## 9. States

Implement all four for the results list and the detail page.

| State                      | Treatment                                                                                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**                | `Skeleton` cards matching real card dimensions - no layout shift on resolve. Never a spinner for content.                                                                                                |
| **Empty (no results)**     | Name the blocking constraint and offer the specific relaxation: _"No products meet Rw ≥ 60 dB with EI 90. Try lowering the acoustic requirement to 54 dB."_ Include a `Button` that applies that change. |
| **Empty (no filters yet)** | Show all products with a quiet prompt: _"Set your project requirements to narrow these results."_ Never a blank screen.                                                                                  |
| **Error**                  | `Alert variant="destructive"` naming what failed, plus a retry `Button`. No apology, no stack trace.                                                                                                     |
| **Invalid input**          | Zod rejects out-of-range params; the UI resets only the offending filter and explains which one and why.                                                                                                 |

---

## 10. Accessibility

Non-negotiable - the brief names it explicitly, and this audience uses the tool on site.

- [ ] All interactive elements keyboard-reachable, logical tab order, **visible focus rings** (never `outline: none` without a replacement)
- [ ] Result count in an `aria-live="polite"` region
- [ ] Filter groups use `fieldset`/`legend` or equivalent ARIA grouping
- [ ] `Slider` exposes `aria-valuetext` as `"54 decibels"`, not a bare number
- [ ] All colour-coded information also carries a text label - **face-paper colour is never the sole signal**
- [ ] Every text/background pair meets WCAG AA (4.5:1 body, 3:1 large). Verify `--primary` and `--ink-muted` with a contrast checker and record results in the README
- [ ] Images have meaningful `alt`; decorative SVGs `aria-hidden`
- [ ] `prefers-reduced-motion` disables all transitions
- [ ] Tap targets ≥ 44×44px on mobile - gloved hands
- [ ] Run axe DevTools on both main routes; document findings

---

## 11. Testing

**Unit (Vitest)**

- `ranking.ts` - threshold logic, least-over-specification ordering, tie-breaks, null handling
- Query-param Zod parsing - valid, invalid, boundary values
- `format.ts` - dimensions, units, file sizes

**Integration (Vitest + RTL)**

- Filter interaction updates the URL
- Search debounce fires once
- Empty state renders the correct relaxation suggestion
- Specification add/remove updates the count

**E2E (Playwright)** - one complete journey, plus two guards:

1. Land → set EI 60 + Rw ≥ 50 → verify all results satisfy both → open a product → add to specification → export → assert export content
2. Search a material number → assert the parent product appears
3. Mobile viewport (390×844): filter Sheet opens, filters apply, results update

**CI:** GitHub Actions running lint → typecheck → unit → build → E2E on push. Badge in the README.

---

## 12. Build phases

Work in this order. Commit at each phase boundary with a conventional-commit message.

| Phase | Deliverable                                                                                                        | Done when                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **0** | Monorepo scaffold, pnpm workspaces, shared Zod package, ESLint/Prettier/Husky, CI skeleton                         | `pnpm lint && pnpm typecheck` passes clean                                                 |
| **1** | Design tokens in `globals.css`, fonts loaded, shadcn init + all needed primitives added, Tailwind mapped to tokens | A tokens preview page renders the palette and all three type roles correctly               |
| **2** | Seed data generator → 40 products, validated against `ProductSchema` at build time                                 | Seed parses with zero Zod errors; edge cases from §6.1 present                             |
| **3** | Nest API: repository, service, `ranking.ts`, DTOs, all four endpoints, error handling                              | Ranking unit tests green; endpoints return correct shapes                                  |
| **4** | Results page: search, filters, URL sync, cards with compliance strip, pagination, sort                             | All §8.1 acceptance criteria met                                                           |
| **5** | Detail page: tabs, variants table, documents table, SSR metadata                                                   | All §8.2 acceptance criteria met                                                           |
| **6** | Specification list + export; compare view                                                                          | Export produces valid Markdown and CSV                                                     |
| **7** | All states from §9; full accessibility pass from §10                                                               | axe reports zero critical issues on both routes                                            |
| **8** | Tests from §11; CI green                                                                                           | All suites pass in CI                                                                      |
| **9** | `README.md`, `DECISIONS.md`, deploy to Vercel + Render, live link in README                                        | A stranger can clone, `pnpm i && pnpm dev`, and understand the product without explanation |

**If time runs short:** cut phase 6's compare view first, then the sustainability tab. **Never cut phases 7, 8 or 9** - states, accessibility and documentation are explicitly graded, and a polished narrow app beats a broad broken one.

---

## 13. Deliverable documentation

### `README.md` structure

1. **The reframe** - open with the product thesis from §1, not a feature list. Two sentences. This is what the evaluator reads first.
2. **Live demo** + screenshots
3. **Quickstart** - `pnpm i && pnpm dev`, prerequisites, ports
4. **Investigation** - the industry, users and their jobs, how specification actually works, what competitor tools do (Systemfinder-style requirement-led selection; Rigips returning a single best-fit variant rather than a list), with sources cited
5. **Product decisions** - why requirement-led not catalogue; why threshold filters; why _exceeds_ is muted; why no prices
6. **Architecture** - diagram, why Nest, why server-side filtering, where a real PIM would attach
7. **Data and sources** - fictional brand, invented figures modelled on public technical structures, cited; limitations stated plainly
8. **Scope** - the in/out table from §3, with a sentence on each cut
9. **Accessibility** - measures taken, contrast results, axe findings
10. **Testing** - what is covered and what deliberately is not
11. **What I would do next** - system-level assemblies, i18n, real PIM, BIM export
12. **AI usage** - state honestly what AI was used for and confirm you reviewed and tested everything

### `DECISIONS.md`

Short ADRs, one per significant call. Each: context → decision → alternatives considered → consequences. Minimum set:

- Requirement-led model over catalogue browse
- Threshold semantics for numeric filters
- Least-over-specification ranking
- Nest.js over Next Route Handlers (with the honest caveat)
- Server-side filtering at prototype scale
- Product/variant separation
- JSON seed over a database
- Fictional brand to avoid trademark and copyright issues
- No `localStorage`

Add a closing section: **"Questions I would have asked a Product Owner."** List 5–8 real ones - _Which persona do we optimise for if they conflict? Do we surface system-level assemblies in v1 or products only? Is regional availability in scope? Should over-specified results be hidden or shown and demoted?_ The JD explicitly names engaging with the Product Owner; this section demonstrates it directly.

---

## 14. Guardrails

Things that would sink the submission - do not do them:

- ❌ Prices, cart, checkout, "Add to basket"
- ❌ Storing performance values as strings (`"EI 90"`)
- ❌ Equality filters where thresholds are correct
- ❌ Flattening variants into the product (losing material numbers)
- ❌ `localStorage` / `sessionStorage`
- ❌ Real Knauf trademarks, logos, product names, imagery or copy
- ❌ Default shadcn appearance with no token customisation
- ❌ Colour as the only carrier of meaning
- ❌ Client-side filtering of the full catalogue
- ❌ Skipping the empty/loading/error states because "it works on the happy path"
- ❌ Adding scope not listed in §3
