# Traditional Homes Repo Wireframe

## Purpose

This document records a quick architecture map of the current Astro website structure. It is intended as a lightweight reference for future agents and Codex sessions before making changes to routes, content collections, property data, media, maps, or the contact backend.

The diagram was generated from Graphify and repo structure analysis. It is a structural guide, not a complete dependency graph.

## Mermaid Preview

```mermaid
flowchart TD
  root["traditional-homes Astro site"]

  root --> config["Build config<br/>astro.config.mjs<br/>tailwind.config.js<br/>package.json"]
  root --> src["src/"]
  root --> public["public/"]
  root --> functions["functions/"]
  root --> tests["tests/"]
  root --> docs["docs/"]
  root --> scripts["scripts/"]

  src --> pages["pages/<br/>route files"]
  src --> layouts["layouts/<br/>Base.astro"]
  src --> components["components<br/>cards, maps, gallery, booking"]
  src --> content["content<br/>houses, villa, blog"]
  src --> inventory["inventory<br/>inventory.json, groups, pairings"]
  src --> i18n["i18n<br/>locale config, routes, translations, SEO helpers"]
  src --> data["data<br/>siteCopy, gallery, locations"]
  src --> utils["utils<br/>validation, gallery sorting, filters, maps"]
  src --> styles["styles/global.css"]
  src --> assets["assets/images/"]

  pages --> base["Base layout"]
  base --> header["Header"]
  base --> footer["Footer"]
  base --> mobileBooking["Mobile booking bar"]
  base --> i18n

  pages --> home["/en/"]
  pages --> collection["/en/houses/"]
  pages --> houseDetail["/en/houses/[slug]/"]
  pages --> villaDetail["/en/villa/[slug]/"]
  pages --> blogRoutes["/blog/ + /blog/[slug]"]
  pages --> infoPages["about, faq, policies, location, contact, guides"]

  home --> inventory
  collection --> inventory
  collection --> groups["groups.json"]
  collection --> filterBar["FilterBar"]
  collection --> unitCard["UnitCard / GroupCard"]

  houseDetail --> inventory
  houseDetail --> content
  houseDetail --> galleryData["gallery.json"]
  houseDetail --> locations["locations.ts"]
  houseDetail --> houseGallery["HouseGallery"]
  houseDetail --> atAGlance["AtAGlance"]
  houseDetail --> singleMap["SinglePinMap"]

  villaDetail --> inventory
  villaDetail --> content
  villaDetail --> galleryData
  villaDetail --> singleMap

  blogRoutes --> content
  location["/en/location/"] --> masterMap["MasterLocationMap"]
  masterMap --> leaflet["LeafletMap"]
  singleMap --> leaflet

  contact["/en/contact/"] --> apiContact["/api/contact"]
  functions --> apiContact
  apiContact --> cloudflareEmail["Cloudflare Email REST API"]

  i18n --> enLocale["English locale JSON<br/>common, navigation, forms, seo"]

  public --> publicImages["images<br/>houses, villa, blog, about, brand"]
  public --> fonts["fonts/"]
  public --> favicons["favicons / manifest / redirects / headers"]
```

## Notes For Agents

- Treat `src/inventory/inventory.json` as the source of truth for property facts.
- Treat `docs/i18n/00_I18N_MASTER_PLAN.md` as the control document before multilingual route, page, or translation work.
- Stage 1 i18n foundation lives under `src/i18n/` and currently provides English-only shared UI strings and locale metadata.
- Property and villa routes combine structured inventory, Markdown content, gallery data, location data, and shared components.
- Public URL assets live under `public/`; imported image assets live under `src/assets/images/`.
- The contact form posts to `/api/contact`, handled by `functions/api/contact.js`.
- This document is documentation-only and should not be used as a reason to refactor runtime code.

## File Locations

- Mermaid source: `docs/architecture/repo-wireframe.mmd`
- Markdown reference: `docs/architecture/repo-wireframe.md`
- Related architecture docs: `docs/architecture/`
