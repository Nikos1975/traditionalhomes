# WebHotelier Integration Notes

These files document the WebHotelier setup for Elounda Traditional Homes.

## Booking Strategy

The public website uses an Intelligent Handoff:

```text
https://traditionalhomes.reserve-online.net/?checkin=YYYY-MM-DD&nights=N&adults=A&room=ROOM_CODE
```

The website collects dates, nights, adults, and optionally a room code, then sends guests to WebHotelier. WebHotelier remains responsible for live availability, alternatives, reservation details, payment, confirmation, and transactional emails.

Do not call authenticated WebHotelier REST booking or availability endpoints from browser JavaScript.

## Theme Files

Use these files in the WebHotelier template/customisation panel:

- `traditional-homes-webhotelier-theme.css`: main desktop and shared visual theme.
- `traditional-homes-webhotelier-mobile.css`: mobile append CSS.

The CSS is intentionally limited to visual styling. It does not hide or remove native WebHotelier booking controls.

The theme files use parser-safe legacy CSS for WebHotelier's custom CSS editor:

- no CSS variables
- no `fit-content`
- no grouped selector blocks for important booking elements
- no keyframe opacity hiding
- no `display: none`, `visibility: hidden`, or `pointer-events: none`

## Required WebHotelier Checks

Before go-live, confirm:

- Direct-link parameters are accepted exactly as used by the site:
  - `checkin`
  - `nights`
  - `adults`
  - `room`
- All room codes in `src/inventory/inventory.json` map to the correct WebHotelier rooms.
- Room-specific unavailable searches show alternative available houses, or the user can search all houses without the `room` parameter.
- GA4 cross-domain tracking is configured for `traditional-homes.gr` and `reserve-online.net`.
- WebHotelier can fire or preserve `begin_checkout` and `purchase` analytics events through GA4/GTM.

## API Reference Files

- `00_WebHotelier_API_Core.md`: Base URL, authentication, methods, and headers.
- `01_Property_Endpoints.md`: Property, room, rate, and extras catalog endpoints.
- `02_Availability_Endpoints.md`: Availability, calendar, flexible calendar, and BAR endpoints.
- `03_Offers_Endpoints.md`: Offer endpoints.
- `04_Booking_Endpoints.md`: Booking creation, cancellation, purge, and lookup endpoints.
- `05_Vouchers_Endpoints.md`: Voucher endpoints.
- `06_Statistics_Endpoints.md`: Statistics endpoints.
