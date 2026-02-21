# Elounda Traditional Homes

Static website for **traditional-homes.gr** — ten stone houses in Mavrikiano and a hillside villa in Vrouchas, Elounda, Crete.

Built with [Astro](https://astro.build) + TypeScript + Tailwind CSS. Hosted on Cloudflare Pages.

---

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the built site locally
npm run typecheck  # Astro type check
```

---

## Deploying to Cloudflare Pages

1. Push the repo to GitHub (or GitLab).
2. In Cloudflare Pages → **Create a project** → connect the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. No environment variables are required for the static build.
5. The `public/_redirects` file is picked up automatically by Cloudflare Pages for redirect rules.

---

## Editing unit data

### Unit properties (sleeps, pool, stairs, amenities, etc.)

Edit **`src/data/inventory.json`** — one object per property.

Key fields:

| Field | Type | Notes |
|---|---|---|
| `slug` | string | URL slug — used in `/en/houses/<slug>/` |
| `type` | `"house"` \| `"villa"` | Houses go under `/en/houses/`, villa under `/en/villa/` |
| `sleeps_max` | number | Maximum occupancy |
| `pool` | `"private"` \| `"shared"` \| `"none"` | |
| `internal_stairs` | boolean | Shown on cards and unit pages |
| `hard_constraints` | string[] | Shown prominently above the fold on unit pages |
| `access_detail` | string \| null | If set, shown as "Access detail" block on the unit page |
| `availability_url` | string | Link to the booking engine for this specific unit |

After editing, run `npm run build` to verify no type errors.

### Global copy (access notes, check-in times, pets policy, etc.)

Edit **`src/data/siteCopy.json`**.

### Gallery images

Edit **`src/data/gallery.json`** — maps each unit slug to an array of image objects:

```json
{
  "leonidas": [
    { "src": "/images/houses/leonidas/01.jpg", "alt": "...", "isFeatured": true },
    { "src": "/images/houses/leonidas/02.jpg", "alt": "...", "isFeatured": false }
  ]
}
```

Exactly **one** image per unit should have `"isFeatured": true` — this is the above-the-fold featured image (preloaded). All others load lazily in the thumbnail grid.

---

## Adding photos

Place photos in the correct directory under `public/`:

```
public/
  images/
    hero.jpg                      ← homepage hero (min 1920px wide)
    og-default.jpg                ← Open Graph default (1200×630px)
    location-map.jpg              ← location page map image
    houses/
      leonidas/
        01.jpg  ← featured (isFeatured: true in gallery.json)
        02.jpg
        03.jpg
        …
      argyro/
        01.jpg
        …
      (same pattern for all 10 houses)
    villa/
      almyra/
        01.jpg  ← featured
        02.jpg
        …
```

**Image requirements:**
- Format: JPEG (add WebP/AVIF via Cloudflare Image Resizing if needed)
- Featured image: minimum **1280px** wide, 16:9 ratio preferred
- Thumbnails: same source file — Cloudflare or your own pipeline handles resizing
- Always match filenames exactly to `src/data/gallery.json`

---

## Site structure

```
/                     → 301 redirect to /en/
/en/                  → Home
/en/houses/           → All houses + villa (with filter chips)
/en/houses/<slug>/    → Individual house page (10 pages)
/en/villa/<slug>/     → Villa page (1 page)
/en/location/
/en/faq/
/en/policies/         → includes #access anchor
/en/about/
/en/contact/
```

---

## Design tokens

Defined in `tailwind.config.js`:

| Token | Value | Used for |
|---|---|---|
| `header-bg` | `#FFFFFF` | Header background |
| `header-border` | `#E6E1D8` | Header bottom border |
| `body-bg` | `#F7F4EE` | Page background |
| `body-text` | `#2C2419` | Primary text |
| `muted` | `#6B5F50` | Secondary text |
| `primary` | `#0BBFF5` | Accent / primary buttons |
| `cta` | `#AC0814` | "Check Availability" CTA |
| `footer-bg` | `#0F2A33` | Footer background |

---

## Non-goals (v1)

- No multi-language support (EN only)
- No embedded booking widget (external booking engine)
- No CMS — all content is in JSON files
- No server-side rendering — 100% static output
