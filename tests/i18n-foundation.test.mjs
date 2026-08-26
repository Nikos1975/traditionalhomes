import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));

describe('Stage 1 i18n foundation', () => {
  it('defines the approved locale strategy in config.ts', async () => {
    const config = await readText('src/i18n/config.ts');

    assert.match(config, /defaultLocale\s*=\s*'en'/);
    assert.match(config, /supportedLocales\s*=\s*\[\s*'en',\s*'de',\s*'fr',\s*'ru',\s*'zh',\s*'ar',\s*'he'\s*\]/);
    assert.match(config, /prefixDefaultLocale\s*=\s*true/);
    assert.match(config, /ar:[\s\S]*dir:\s*'rtl'/);
    assert.match(config, /he:[\s\S]*nativeLabel:\s*'עברית'[\s\S]*lang:\s*'he'[\s\S]*dir:\s*'rtl'/);
  });

  it('keeps future locale route helpers stable for Hebrew without translated slugs', async () => {
    const routes = await readText('src/i18n/routes.ts');

    assert.match(routes, /localizedPath\(locale: string \| undefined, path = '\/'\)/);
    assert.match(routes, /`\/\$\{safeLocale\}\/\$\{cleanPath\}\/`/);
    assert.doesNotMatch(routes, /עברית|בתים|וילה|מדריך/);
  });

  it('prepares hreflang helper infrastructure without rendering unavailable locale alternates', async () => {
    const seo = await readText('src/i18n/seo.ts');
    const base = await readText('src/layouts/Base.astro');

    assert.match(seo, /export type HreflangAlternate/);
    assert.match(seo, /localizedHreflangAlternates\(pathsByLocale: Partial<Record<Locale, string>>\)/);
    assert.match(seo, /isLocale\(locale\)/);
    assert.match(seo, /getLocaleMeta\(locale\)\.lang/);
    assert.match(seo, /canonicalUrl\(pathWithSlash\)/);
    assert.doesNotMatch(base, /rel="alternate"|hreflang/);
  });

  it('centralizes static English SEO metadata without changing rendered values', async () => {
    const seoCopy = await readJson('src/i18n/locales/en/seo.json');
    const seo = await readText('src/i18n/seo.ts');
    const pages = {
      home: await readText('src/components/pages/HomePage.astro'),
      houses: await readText('src/components/pages/CollectionPage.astro'),
      location: await readText('src/components/pages/LocationPage.astro'),
      contact: await readText('src/pages/en/contact.astro'),
      faq: await readText('src/pages/en/faq.astro'),
      policies: await readText('src/pages/en/policies.astro'),
      about: await readText('src/pages/en/about.astro'),
    };

    assert.deepEqual(seoCopy.pages, {
      home: {
        title: 'Elounda Traditional Homes | Traditional Stone Houses & Villa in Crete',
        description:
          'Ten traditional stone houses in Mavrikiano and a hillside villa in Vrouchas — Elounda, Crete. Calm stays, direct booking.',
      },
      houses: {
        title: 'The Collection | Stone Houses & Villa in Elounda | Elounda Traditional Homes',
        description:
          'Browse all ten traditional stone houses in Mavrikiano, Elounda. Filter by size, pool, and accessibility. Book direct.',
      },
      location: {
        title: 'Location — Mavrikiano & Vrouchas, Elounda | Elounda Traditional Homes',
        description:
          'Mavrikiano and Vrouchas sit above Elounda Bay on the northeast coast of Crete. 5 minutes to the sea, away from the noise.',
      },
      contact: {
        title: 'Contact & Inquiries | Elounda Traditional Homes',
        description: 'Contact Elounda Traditional Homes — get in touch with questions or booking enquiries.',
      },
      faq: {
        title: 'FAQ | Frequently Asked Questions | Elounda Traditional Homes',
        description:
          'Frequently asked questions about Elounda Traditional Homes — access, pools, pets, Wi-Fi, parking, and more.',
      },
      policies: {
        title: 'Policies & House Rules | Elounda Traditional Homes',
        description:
          'House rules, access information, pet policy, check-in times, and cancellation terms for Elounda Traditional Homes.',
      },
      about: {
        title: 'Our Story | Elounda Traditional Homes',
        description:
          'About Elounda Traditional Homes — a family-run collection of restored stone houses in Mavrikiano, Elounda, Crete.',
      },
    });

    assert.match(seo, /export type PageSeoKey = keyof ReturnType<typeof getSeoCopy>\['pages'\]/);
    assert.match(seo, /getPageSeo\(locale: string \| undefined, page: PageSeoKey\)/);
    assert.match(seo, /return getSeoCopy\(locale\)\.pages\[page\]/);

    for (const [key, page] of Object.entries(pages)) {
      // Shared renderers take the locale as a prop; single-locale pages still
      // pass the default locale explicitly.
      assert.match(page, new RegExp(`getPageSeo\\((?:defaultLocale|locale), '${key}'\\)`));
      assert.doesNotMatch(page, /metaDescription(?:Home|Houses|Location|Contact|Faq|Policies|About)/);
    }
  });

  it('uses an existing default Open Graph image', async () => {
    const seoCopy = await readJson('src/i18n/locales/en/seo.json');
    const base = await readText('src/layouts/Base.astro');

    assert.equal(seoCopy.defaultOgImage, '/images/brand/home-hero-spinalonga-1024.webp');
    assert.match(base, /ogImage = '\/images\/brand\/home-hero-spinalonga-1024\.webp'/);
    await access(new URL('../public/images/brand/home-hero-spinalonga-1024.webp', import.meta.url));
  });

  it('formats dynamic English SEO through helpers without moving facts into translations', async () => {
    const seoCopy = await readJson('src/i18n/locales/en/seo.json');
    const seo = await readText('src/i18n/seo.ts');
    const housePage = await readText('src/components/pages/HouseDetailPage.astro');
    // The villa route is a thin wrapper since the German villa page was added;
    // its SEO is formatted by the shared renderer it delegates to.
    const villaPage = await readText('src/components/pages/VillaDetailPage.astro');
    const mavrikianoGuide = await readText('src/pages/en/guide/mavrikiano.astro');
    // The Vrouchas route is a thin wrapper since the Stage 3 pilot; its SEO is
    // formatted by the shared renderer it delegates to.
    const guidePage = await readText('src/components/pages/GuidePage.astro');

    assert.match(seo, /export function getPropertySeo\(/);
    assert.match(seo, /export function getVillaSeo\(/);
    assert.match(seo, /export function getGuideSeo\(/);

    assert.match(housePage, /getPropertySeo\(/);
    assert.match(villaPage, /getVillaSeo\(/);
    assert.match(mavrikianoGuide, /getGuideSeo\(/);
    assert.match(guidePage, /getGuideSeo\(locale, frontmatter, fallbackDescription\)/);

    // SEO copy may carry the *labels* ("sleeps", "bedrooms") because the
    // description template assembles them; it must never carry inventory values.
    const seoText = JSON.stringify(seoCopy);
    assert.doesNotMatch(seoText, /\b\d+\s*(?:m²|m2|guests?|bedrooms?|bathrooms?)\b/i);
    assert.doesNotMatch(seoText, /private 9 m/);
    assert.doesNotMatch(seoText, /argyro|almond-tree-villa|roomCode|bookingId/i);
  });

  it('keeps current English Header labels and links in navigation.json', async () => {
    const navigation = await readJson('src/i18n/locales/en/navigation.json');

    assert.deepEqual(navigation.main, [
      { label: 'Houses', href: '/en/houses/' },
      { label: 'Villa', href: '/en/villa/almond-tree-villa/' },
      { label: 'Location', href: '/en/location/' },
      { label: 'FAQ', href: '/en/faq/' },
      { label: 'About', href: '/en/about/' },
      { label: 'Blog', href: '/en/blog/' },
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

  it('centralizes shared UI labels for filters, galleries, maps, and Base chrome', async () => {
    const common = await readJson('src/i18n/locales/en/common.json');
    const forms = await readJson('src/i18n/locales/en/forms.json');
    const base = await readText('src/layouts/Base.astro');
    const filterBar = await readText('src/components/FilterBar.astro');
    const galleryA = await readText('src/components/GalleryA.astro');
    const houseGallery = await readText('src/components/gallery/HouseGallery.astro');
    const mapPreview = await readText('src/components/maps/MapPreview.astro');
    const masterLocationMap = await readText('src/components/maps/MasterLocationMap.astro');
    const leafletMap = await readText('src/components/maps/LeafletMap.astro');
    const singlePinMap = await readText('src/components/maps/SinglePinMap.astro');

    assert.equal(forms.booking.quickSearchAriaLabel, 'Quick availability search');
    assert.equal(forms.booking.check, 'Check');
    assert.equal(forms.contact.openChatLabel, 'Open chat');
    assert.equal(forms.contact.chatTitle, 'Questions? Chat with us');
    assert.equal(
      forms.contact.chatPopupBeforeEmail,
      'For booking enquiries, please use the availability button or email',
    );
    assert.equal(forms.contact.chatPopupEmail, 'info@traditional-homes.gr');
    assert.equal(forms.contact.chatPopupAfterEmail, 'Chat coming soon.');

    assert.deepEqual(common.ui.filters.viewTabs, {
      all: 'All stays',
      houses: 'Houses',
      villa: 'Villa',
      groups: 'Group stays',
    });
    assert.equal(common.ui.filters.quick.sleeps4, 'Sleeps 4+');
    assert.equal(common.ui.filters.quick.privatePool, 'Private pool');
    assert.equal(common.ui.filters.clear, 'Clear filters');
    assert.equal(common.ui.filters.countSingle, 'property matches');
    assert.equal(common.ui.filters.countPlural, 'properties match');

    assert.equal(common.ui.gallery.viewAll, 'View all');
    assert.equal(common.ui.gallery.hidePhotos, 'Hide photos');
    assert.equal(common.ui.gallery.closeViewer, 'Close photo viewer');
    assert.equal(common.ui.gallery.previousPhoto, 'Previous photo');
    assert.equal(common.ui.gallery.nextPhoto, 'Next photo');

    assert.equal(common.ui.map.exploreArea, 'Explore the Area');
    assert.equal(common.ui.map.filters.all, 'All');
    assert.equal(common.ui.map.filters.houses, 'Houses');
    assert.equal(common.ui.map.filters.villa, 'Villa');
    assert.equal(common.ui.map.actions.map, 'Map');
    assert.equal(common.ui.map.actions.details, 'Details');
    assert.equal(common.ui.map.actions.viewDetails, 'View Details');
    assert.equal(common.ui.map.actions.bookNow, 'Book Now');
    assert.equal(common.ui.map.actions.exploreInteractiveMap, 'Explore interactive map');
    assert.equal(common.ui.map.actions.viewMap, 'View map');
    assert.equal(common.ui.map.unavailable, 'Map coordinates unavailable');

    assert.match(base, /getCommonCopy\(locale\)/);
    assert.match(base, /getFormsCopy\(locale\)/);
    assert.match(base, /bookingCopy\.quickSearchAriaLabel/);
    assert.match(base, /contactCopy\.chatPopupBeforeEmail/);
    assert.match(base, /common\.brand\.name/);
    assert.match(filterBar, /getCommonCopy\(locale\)/);
    assert.match(filterBar, /locale = defaultLocale/);
    assert.match(filterBar, /filterCopy\.viewTabs\.all/);
    assert.match(filterBar, /filterLabels = /);
    assert.match(galleryA, /getCommonCopy\(defaultLocale\)/);
    assert.match(galleryA, /galleryCopy\.previousPhoto/);
    assert.match(houseGallery, /getCommonCopy\(locale\)/);
    assert.match(houseGallery, /locale = defaultLocale/);
    assert.match(houseGallery, /galleryCopy\.viewAllPhotos/);
    assert.match(mapPreview, /getCommonCopy\(locale\)/);
    assert.match(mapPreview, /locale = defaultLocale/);
    assert.match(mapPreview, /mapCopy\.actions\.exploreInteractiveMap/);
    assert.match(masterLocationMap, /getCommonCopy\(locale\)/);
    assert.match(masterLocationMap, /locale = defaultLocale/);
    assert.match(masterLocationMap, /mapCopy\.exploreArea/);
    assert.match(leafletMap, /mapLabels/);
    assert.match(leafletMap, /viewDetails: mapCopy\.actions\.viewDetails/);
    assert.match(leafletMap, /data-map-labels=\{JSON\.stringify\(mapLabels\)\}/);
    assert.match(leafletMap, /labels\.viewDetails/);
    assert.match(singlePinMap, /mapCopy\.actions\.viewMap/);
  });

  it('defines exact reusable English property interface copy without inventory facts', async () => {
    const common = await readJson('src/i18n/locales/en/common.json');

    assert.deepEqual(common.ui.property, {
      labels: {
        sleeps: 'Sleeps',
        size: 'Size',
        bedroom: 'Bedroom',
        bedrooms: 'Bedrooms',
        bathroom: 'Bathroom',
        bathrooms: 'Bathrooms',
        layout: 'Layout',
        view: 'View',
        access: 'Access',
        parking: 'Parking',
        practicalUse: 'Practical Use',
        outdoorSpace: 'Outdoor Space',
        pool: 'Pool',
        wifi: 'Wi-Fi',
        pets: 'Pets',
        included: 'Included',
        seaView: 'Sea view',
      },
      counts: {
        guestsUpTo: { one: 'Up to {count} Guest', other: 'Up to {count} Guests' },
        bedrooms: { one: '{count} Bedroom', other: '{count} Bedrooms' },
        bathrooms: { one: '{count} bathroom', other: '{count} bathrooms' },
        bathroomsCompact: { one: '{count} Bath', other: '{count} Baths' },
        sleeps: { other: 'Sleeps {count}' },
      },
      basics: { house: 'House Basics', villa: 'Villa Basics' },
      // Display strings a component derives from stable inventory facts. Keyed by
      // a stable semantic key, never by the English text itself.
      derived: {
        bathroom: {
          showerRoom: 'Shower room',
          viaCourtyard: 'Accessed via courtyard area',
        },
        layout: {
          splitLevelVilla: 'Split-level traditional villa',
          connectedLevelsOntas: 'Connected levels with ontas',
          mainLevelOntas: 'Main level + ontas',
          mainLivingSpaceOntas: 'Main living space + ontas',
          courtyardLevelOntas: 'Courtyard level + ontas',
          firstFloorAboveEfterpiOntas: 'First-floor house above Efterpi + ontas',
          multiLevelInternalStairs: 'Multi-level house with internal stairs',
          groundFloor: 'Ground floor',
          groundAndFirstFloor: 'Ground floor + first floor',
        },
        access: {
          internalStairsSteppedLevels: 'Internal stairs and stepped levels',
          entranceStepInternalStairs: 'Entrance step + internal stairs',
          stoneStepsInternalWoodenStairs: 'Stone steps to entrance; internal wooden stairs',
          externalStepsInternalStairsToOntas: 'External steps + internal stairs to ontas',
          courtyardEntryInternalStairs: 'Courtyard entry + internal stairs',
          stepsDownToCourtyardStairToOntas: 'Steps down to courtyard; internal stair to ontas',
          stoneStairsBalconyEntrance: 'Stone stairs to balcony entrance',
          courtyardEntranceInternalStairs: 'Courtyard entrance + internal stairs',
          stepFree: 'Step-free',
          internalStairsEntranceViaStairsDown: 'Internal stairs; entrance via stairs down',
          internalStairs: 'Internal stairs',
        },
      },
      card: {
        photoComingSoon: 'Photo Coming Soon',
        villa: 'Villa',
        editorNote: "Editor's Note:",
        details: 'Details',
        detailsInEnglish: 'Details in English',
        checkDates: 'Check dates',
        features: {
          directSeaView: 'Direct Sea View',
          directSeaViewPrivatePool: 'Direct Sea View · Private Pool',
          sharedPool: 'Shared Pool',
          privatePool: 'Private Pool',
          firstFloor: 'First Floor',
          groundFloor: 'Ground Floor',
          privateVillaVrouchas: 'Private Villa · Vrouchas',
        },
      },
      group: {
        privateEstate: 'Private Estate',
        includes: 'Includes:',
        exclusiveSharedPool: 'Exclusive Estate Pool Area',
        privatePoolsIncluded: 'Private Pools Included',
        editorNote: "Editor's Note:",
        view: 'View',
        checkDates: 'Check Dates',
        note: 'Select both properties for the exact same dates on our booking engine to secure this group estate.',
        viewProperty: 'View {name}',
      },
      detail: {
        breadcrumbs: { ariaLabel: 'Breadcrumb', home: 'Home', houses: 'Houses' },
        sections: {
          propertyPhotosAria: 'Property photos',
          atAGlance: 'At a Glance',
          aboutHouseAria: 'About this house',
          aboutVillaAria: 'About this villa',
          amenitiesAria: 'Amenities',
          included: "What's included",
          locationArrivalAria: 'Location and arrival',
          locationArrival: 'Location & Arrival',
          neighbouringHouses: 'Neighbouring Houses',
          suggestedNearbyCombinationsAria: 'Suggested nearby combinations',
          suggestedCombinations: 'Traveling together? Suggested nearby combinations',
        },
        booking: {
          checkDates: 'Check dates',
          checkThisHouse: 'Check this house',
          description: 'Choose dates and continue to live availability for this property.',
          askQuestion: 'Ask a Question',
          beforeYouBook: 'Before you book',
        },
        location: {
          howToArrive: 'How to arrive',
          sharedGuestParking: 'Shared guest parking',
          houseEntrance: 'House entrance',
          locationNote: 'Location note',
          locationDetails: 'Location details',
          viewVillaMap: 'View villa map',
          openInGoogleMaps: 'Open in Google Maps',
        },
        nearby: {
          includes: 'Includes:',
          view: 'View',
          sleeps: 'Sleeps',
          poolViewOnly: 'Pool view only',
          privateDippingPool: 'Private dipping pool',
          privatePool: 'Private pool',
          sharedPool: 'Shared pool',
        },
        guide: { vrouchasTitle: 'Vrouchas Area Guide', practicalAreaDetails: 'Practical area details' },
        sharedPool: {
          intro: "This property's swimming pool is shared exclusively with",
          and: 'and',
          note: 'Booking both houses together gives one group use of both houses around the same shared pool area.',
        },
      },
    });

    assert.doesNotMatch(JSON.stringify(common.ui.property), /argyro|almond-tree-villa|bookingId|roomCode|coordinates/i);
    assert.doesNotMatch(JSON.stringify(common.ui.property), /bookingInstruction/);

    const atAGlance = await readText('src/components/AtAGlance.astro');
    const unitCard = await readText('src/components/UnitCard.astro');
    const groupCard = await readText('src/components/GroupCard.astro');
    const housePage = await readText('src/components/pages/HouseDetailPage.astro');
    // The villa route is a thin wrapper since the German villa page was added;
    // the shared renderer it delegates to owns the interface copy.
    const villaPage = await readText('src/components/pages/VillaDetailPage.astro');
    const blogIndex = await readText('src/pages/en/blog/index.astro');
    const blogPost = await readText('src/pages/en/blog/[...slug].astro');
    const base = await readText('src/layouts/Base.astro');
    const translate = await readText('src/i18n/translate.ts');

    for (const component of [atAGlance, unitCard, groupCard]) {
      assert.match(component, /locale\?: Locale/);
      assert.match(component, /locale = defaultLocale/);
      assert.match(component, /getCommonCopy\(locale\)\.ui\.property/);
    }

    assert.match(housePage, /getCommonCopy\(locale\)\.ui\.property/);
    // The villa renderer is locale-aware now, like the house renderer.
    assert.match(villaPage, /getCommonCopy\(locale\)\.ui\.property/);
    assert.match(blogIndex, /blogArticlePath\(post\.id, defaultLocale\)/);
    assert.match(blogPost, /blogIndexPath\(defaultLocale\)/);
    assert.match(blogPost, /blogArticlePath\(post\.id, defaultLocale\)/);
    assert.doesNotMatch(blogIndex, /\/en\/blog\//);
    assert.doesNotMatch(blogPost, /\/en\/blog\//);
    assert.doesNotMatch(base, /rel="alternate"|hreflang|language selector/i);
    assert.match(translate, /const dictionaries = \{\s*en:/);
  });

  it('uses route helpers for repeated property and map links without changing blog routes', async () => {
    const files = {
      atAGlance: await readText('src/components/AtAGlance.astro'),
      groupCard: await readText('src/components/GroupCard.astro'),
      mapPreview: await readText('src/components/maps/MapPreview.astro'),
      masterLocationMap: await readText('src/components/maps/MasterLocationMap.astro'),
      singlePinMap: await readText('src/components/maps/SinglePinMap.astro'),
      unitCard: await readText('src/components/UnitCard.astro'),
      housePage: await readText('src/components/pages/HouseDetailPage.astro'),
      villaPage: await readText('src/components/pages/VillaDetailPage.astro'),
      locationPage: await readText('src/components/pages/LocationPage.astro'),
      blogIndex: await readText('src/pages/en/blog/index.astro'),
      blogPost: await readText('src/pages/en/blog/[...slug].astro'),
    };

    const helperManagedFiles = [
      files.atAGlance,
      files.groupCard,
      files.mapPreview,
      files.masterLocationMap,
      files.singlePinMap,
      files.unitCard,
      files.housePage,
      files.villaPage,
      files.locationPage,
    ];

    for (const file of helperManagedFiles) {
      assert.doesNotMatch(file, /`\/en\/(?:houses|villa)\/\$\{/);
    }

    // The shared-pool neighbour is resolved through the authoritative inventory:
    // the slug is the routing key, the inventory owns the name, and the locale
    // only presents it. A name is never derived from slug formatting.
    assert.match(files.atAGlance, /housePath\(shared\.slug, locale\)/);
    assert.match(files.atAGlance, /unitName\(locale, shared\.slug, shared\.name\)/);
    assert.doesNotMatch(files.atAGlance, /slug\.replace\(/);
    assert.match(files.groupCard, /resolveLocalizedLink\(locale, 'house', firstMemberSlug\)/);
    assert.match(files.mapPreview, /resolveLocalizedLink\(locale, 'location'\)/);
    assert.match(files.masterLocationMap, /unit\.type === 'villa'[\s\S]*resolveLocalizedLink\(locale, 'villa', unit\.slug\)[\s\S]*resolveLocalizedLink\(locale, 'house', unit\.slug\)/);
    assert.match(files.singlePinMap, /location\.type === 'villa'[\s\S]*villaPath\(location\.slug, locale\)[\s\S]*housePath\(location\.slug, locale\)/);
    assert.match(files.unitCard, /unit\.type === "villa"[\s\S]*resolveLocalizedLink\(locale, 'villa', unit\.slug\)[\s\S]*resolveLocalizedLink\(locale, 'house', unit\.slug\)/);
    assert.match(files.housePage, /canonicalUrl\(routePath\(locale, 'house', slug\)\)/);
    // The villa renderer resolves its own canonical and links through the route
    // map, the same way the house renderer does. The unreachable redirect guard
    // the English-only page carried is gone: getStaticPaths supplies the unit,
    // and missing locale content fails the build loudly instead of redirecting.
    assert.match(files.villaPage, /canonicalUrl\(routePath\(locale, 'villa', slug\)\)/);
    assert.match(files.villaPage, /resolveLocalizedLink\(locale, 'houses'\)/);
    assert.doesNotMatch(files.villaPage, /Astro\.redirect/);
    assert.match(files.locationPage, /unit\.type === 'villa'[\s\S]*resolveLocalizedLink\(locale, 'villa', unit\.slug\)[\s\S]*resolveLocalizedLink\(locale, 'house', unit\.slug\)/);

    for (const file of helperManagedFiles) {
      assert.doesNotMatch(file, /\b(?:housePath|villaPath)\([^,)]*\)/);
    }

    assert.match(files.blogIndex, /blogArticlePath\(post\.id, defaultLocale\)/);
    assert.match(files.blogPost, /blogIndexPath\(defaultLocale\)/);
  });

  it('uses route and SEO helpers on static English pages without changing blog or contact endpoints', async () => {
    const staticPages = {
      homePage: await readText('src/components/pages/HomePage.astro'),
      about: await readText('src/pages/en/about.astro'),
      contact: await readText('src/pages/en/contact.astro'),
      faq: await readText('src/pages/en/faq.astro'),
      policies: await readText('src/pages/en/policies.astro'),
      housesIndex: await readText('src/pages/en/houses/index.astro'),
      collectionPage: await readText('src/components/pages/CollectionPage.astro'),
      mavrikianoGuide: await readText('src/pages/en/guide/mavrikiano.astro'),
      vrouchasGuide: await readText('src/pages/en/guide/vrouchas.astro'),
      guidePage: await readText('src/components/pages/GuidePage.astro'),
    };

    const hardcodedEnglishRoute =
      /(?:href="\/en\/|['"`]\/en\/(?:houses|villa|location|guide|contact|faq|about|policies)\/|canonicalUrl="https:\/\/traditional-homes\.gr\/en\/)/;

    for (const page of Object.values(staticPages)) {
      assert.doesNotMatch(page, hardcodedEnglishRoute);
    }

    assert.match(staticPages.homePage, /canonicalUrl\(routePath\(locale, 'home'\)\)/);
    assert.match(staticPages.homePage, /resolveLocalizedLink\(locale, 'house', 'argyro'\)/);
    assert.match(staticPages.homePage, /resolveLocalizedLink\(locale, 'villa', villa\.slug\)/);
    assert.match(staticPages.about, /localizedCanonical\(defaultLocale, localizedPath\(defaultLocale, 'about'\)\)/);
    assert.match(staticPages.contact, /action="\/api\/contact"/);
    assert.match(staticPages.contact, /contactSentPath = `\$\{localizedPath\(defaultLocale, 'contact'\)\}\?sent=1`/);
    assert.match(staticPages.contact, /<script define:vars=\{\{ contactSentPath \}\}>/);
    assert.match(staticPages.faq, /localizedPath\(defaultLocale, 'policies'\)\}\#access/);
    assert.match(staticPages.collectionPage, /canonicalUrl\(routePath\(locale, 'houses'\)\)/);
    assert.match(staticPages.mavrikianoGuide, /guidePath\('mavrikiano'\)/);
    assert.match(staticPages.guidePage, /routePath\(locale, 'guide', guideId\)/);

    const navigation = await readJson('src/i18n/locales/en/navigation.json');
    assert.equal(navigation.main.find((link) => link.label === 'Blog')?.href, '/en/blog/');
  });

  it('has an explicit 404 page so missing locale-prefixed routes do not serve the root redirect stub', async () => {
    const notFoundPage = await readText('src/pages/404.astro');

    assert.match(notFoundPage, /Page not found/);
    assert.doesNotMatch(notFoundPage, /Astro\.redirect/);
    assert.match(notFoundPage, /href="\/en\/blog\/"/);
  });
});
