# I18N QA Checklist

Run the relevant parts of this checklist after each i18n implementation stage.

## Build And Route Checks

- [ ] Build passes.
- [ ] `/en/` still works.
- [ ] Root `/` still redirects correctly.
- [ ] Internal links stay in the selected locale.
- [ ] No broken slugs.
- [ ] No broken images.

## Shared UI Checks

- [ ] Header is correct.
- [ ] Footer is correct.
- [ ] Language switcher is correct.
- [ ] Booking/contact UI is correct.
- [ ] Contact form still posts to `/api/contact`.

## SEO Checks

- [ ] Canonical URLs are correct.
- [ ] Hreflang is correct.
- [ ] Sitemap is correct.

## Arabic RTL Checks

- [ ] Arabic has `lang="ar"`.
- [ ] Arabic has `dir="rtl"`.
- [ ] Arabic mobile menu checked.
- [ ] Map/sidebar layout checked.

## Configuration Safety Checks

- [ ] No DNS configuration changed.
- [ ] No Cloudflare variables changed.
- [ ] No email routing changed.
- [ ] No Gmail setup changed.
- [ ] `functions/api/contact.js` behavior unchanged.
