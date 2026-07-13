import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));

describe('Stage 1 i18n foundation', () => {
  it('defines the approved locale strategy in config.ts', async () => {
    const config = await readText('src/i18n/config.ts');

    assert.match(config, /defaultLocale\s*=\s*'en'/);
    assert.match(config, /supportedLocales\s*=\s*\[\s*'en',\s*'de',\s*'fr',\s*'ru',\s*'zh',\s*'ar'\s*\]/);
    assert.match(config, /prefixDefaultLocale\s*=\s*true/);
    assert.match(config, /ar:[\s\S]*dir:\s*'rtl'/);
  });

  it('keeps current English Header labels and links in navigation.json', async () => {
    const navigation = await readJson('src/i18n/locales/en/navigation.json');

    assert.deepEqual(navigation.main, [
      { label: 'Houses', href: '/en/houses/' },
      { label: 'Villa', href: '/en/villa/almond-tree-villa/' },
      { label: 'Location', href: '/en/location/' },
      { label: 'FAQ', href: '/en/faq/' },
      { label: 'About', href: '/en/about/' },
      { label: 'Blog', href: '/blog/' },
      { label: 'Contact', href: '/en/contact/' },
    ]);
    assert.equal(navigation.brand.homeHref, '/en/');
    assert.equal(navigation.actions.checkDates, 'Check Dates');
  });

  it('keeps current English Footer labels and links in common.json', async () => {
    const common = await readJson('src/i18n/locales/en/common.json');

    assert.equal(common.brand.name, 'Elounda Traditional Homes');
    assert.equal(common.brand.kicker, 'Mavrikiano & Vrouchas · Crete');
    assert.equal(
      common.footer.description,
      'A family-run collection of traditional stone houses in Mavrikiano and one larger villa in Vrouchas, above Elounda.',
    );
    assert.deepEqual(common.footer.collection.links, [
      { label: 'All Stone Houses', href: '/en/houses/' },
      { label: 'Almond Tree Villa', href: '/en/villa/almond-tree-villa/' },
    ]);
    assert.deepEqual(common.footer.legal.links, [
      { label: 'Policies', href: '/en/policies/' },
      { label: 'Accessibility', href: '/en/policies/#access' },
      { label: 'traditional-homes.gr', href: 'https://traditional-homes.gr' },
    ]);
  });

  it('wires Base, Header, and Footer to locale-aware helpers without changing routes', async () => {
    const base = await readText('src/layouts/Base.astro');
    const header = await readText('src/components/Header.astro');
    const footer = await readText('src/components/Footer.astro');

    assert.match(base, /getLocaleMeta\(locale\)/);
    assert.match(base, /<html lang=\{localeMeta\.lang\} dir=\{localeMeta\.dir\}>/);
    assert.match(base, /<Header locale=\{locale\}/);
    assert.match(base, /<Footer locale=\{locale\}/);
    assert.match(header, /getNavigationCopy\(locale\)/);
    assert.match(footer, /getCommonCopy\(locale\)/);
    assert.doesNotMatch(header, /href: '\/de\//);
    assert.doesNotMatch(footer, /href: '\/de\//);
  });

  it('keeps shared booking form labels in forms.json and wires the booking component to them', async () => {
    const forms = await readJson('src/i18n/locales/en/forms.json');
    const bookingForm = await readText('src/components/booking/BookingHandoffForm.astro');

    assert.equal(forms.booking.defaultItemName, 'Elounda Traditional Homes');
    assert.equal(forms.booking.defaultTitle, 'Check availability');
    assert.equal(
      forms.booking.defaultDescription,
      'Choose your dates and continue to our secure booking system.',
    );
    assert.equal(forms.booking.arrival, 'Arrival');
    assert.equal(forms.booking.nights, 'Nights');
    assert.equal(forms.booking.adults, 'Adults');
    assert.equal(forms.booking.checkAvailability, 'Check Availability');
    assert.equal(forms.booking.searchAllAvailableProperties, 'Search all available properties');
    assert.equal(
      forms.booking.finalAvailabilityNote,
      'Final availability, rates, and alternatives continue in WebHotelier.',
    );

    assert.match(bookingForm, /getFormsCopy\(locale\)/);
    assert.match(bookingForm, /bookingCopy\.arrival/);
    assert.match(bookingForm, /bookingCopy\.nights/);
    assert.match(bookingForm, /bookingCopy\.adults/);
    assert.match(bookingForm, /bookingCopy\.searchAllAvailableProperties/);
    assert.match(bookingForm, /bookingCopy\.finalAvailabilityNote/);
  });
});
