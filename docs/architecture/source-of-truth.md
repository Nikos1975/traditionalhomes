# Source of Truth

This project keeps factual property data separate from narrative copy.

## Property Facts

`src/inventory/inventory.json` is the factual property source for house and villa data. This includes capacity, bedrooms, bathrooms, floors, stairs, pool information, view, parking, access notes, constraints, booking identifiers, official groups, and suggested relationships when represented as structured data.

Markdown content is narrative copy only. Markdown files can describe a property, its setting, and practical guest experience, but they must not override factual property data from `src/inventory/inventory.json`.

When Markdown and inventory disagree, treat the Markdown as suspect and verify against the inventory source before publishing changes.

## Supporting Data Sources

`src/data/gallery.json` controls gallery image ordering and gallery metadata.

`src/data/locations.ts` controls location and map metadata, including map coordinates, map labels, Google Maps URLs, parking references, and map image hints.

`src/data/siteCopy.json` controls shared UI and site copy such as global labels, metadata descriptions, booking-engine URL, policy snippets, access notes, and reusable page text.

## Reference-Only Material

Research files, design mockups, old Airbnb-style copy, generated notes, and archived drafts are reference only. They are not sources of truth for live property facts or current brand voice.

Before using reference material in live pages, check it against the structured data sources and the current editorial rules.
