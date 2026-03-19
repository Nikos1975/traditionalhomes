export type LocationItem = {
    id: string
    type: "house" | "villa" | "parking"
    group: "mavrikiano" | "vrouchas"
    title: string
    slug: string
    locationLabel: string
    lat: number
    lng: number
    googleMapsUrl: string | null
    image?: string
    subtitle?: string
    needsVerification: boolean
    coordinateSource: "direct"
    source: string
}

export const locations: LocationItem[] = [
    {
        id: "argyro",
        type: "house",
        group: "mavrikiano",
        title: "Argyro",
        slug: "argyro",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266730,
        lng: 25.719753,
        googleMapsUrl: "https://goo.gl/maps/W4dYTNibdcbtHaJKA",
        image: "/images/houses/argyro/480/argyro-hero-veranda-sea-view-01-480.webp",
        subtitle: "Stone House • Sleeps 4",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "leonidas",
        type: "house",
        group: "mavrikiano",
        title: "Leonidas",
        slug: "leonidas",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26682835758118,
        lng: 25.719443276176985,
        googleMapsUrl: "https://goo.gl/maps/PFL8D7ojmPa2GkYo8",
        image: "/images/houses/leonidas/480/leonidas-hero-terrace-sea-view-01-480.webp",
        subtitle: "Stone House • Sleeps 3",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "margarita",
        type: "house",
        group: "mavrikiano",
        title: "Margarita",
        slug: "margarita",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266856693513596,
        lng: 25.719514526068675,
        googleMapsUrl: "https://goo.gl/maps/oBoYTAqEBQJRTb9P6",
        image: "/images/houses/margarita/480/margarita-hero-terrace-sea-view-01-480.webp",
        subtitle: "Stone House • Sleeps 6",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "clio",
        type: "house",
        group: "mavrikiano",
        title: "Clio",
        slug: "clio",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266957667346475,
        lng: 25.718782164603414,
        googleMapsUrl: "https://goo.gl/maps/8eZxC4NA9JQH8DFM7",
        image: "/images/houses/clio/480/clio-hero-interior-balcony-view-01-480.webp",
        subtitle: "Stone House • Sleeps 4",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "erato",
        type: "house",
        group: "mavrikiano",
        title: "Erato",
        slug: "erato",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266957667346475,
        lng: 25.718782164603414,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35.266957667346475,25.718782164603414",
        image: "/images/houses/erato/480/erato-hero-private-pool-01-480.webp",
        subtitle: "Stone House • Private Pool • Sleeps 4",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "demetra",
        type: "house",
        group: "mavrikiano",
        title: "Demetra",
        slug: "demetra",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.2667694985783,
        lng: 25.71884451908012,
        googleMapsUrl: "https://goo.gl/maps/X3L8yFbk3W8YZCBK8",
        image: "/images/houses/demetra/480/demetra-hero-shared-pool-01-480.webp",
        subtitle: "Stone House • Shared Pool • Sleeps 4",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "penelope",
        type: "house",
        group: "mavrikiano",
        title: "Penelope",
        slug: "penelope",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.2668510316977,
        lng: 25.718792311479703,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35.2668510316977,25.718792311479703",
        image: "/images/houses/penelope/480/penelope-hero-arched-doorway-view-01-480.webp",
        subtitle: "Stone House • Shared Pool • Sleeps 6",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "efterpi",
        type: "house",
        group: "mavrikiano",
        title: "Efterpi",
        slug: "efterpi",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26675475538971,
        lng: 25.71892073639966,
        googleMapsUrl: "https://maps.app.goo.gl/LyrmpEy4huy3RB4p8",
        image: "/images/houses/efterpi/480/efterpi-hero-exterior-01-480.webp",
        subtitle: "Stone House • Sleeps 5",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "kalliopi",
        type: "house",
        group: "mavrikiano",
        title: "Kalliopi",
        slug: "kalliopi",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26681671540303,
        lng: 25.718993121354547,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35.26681671540303,25.718993121354547",
        image: "/images/houses/kalliopi/480/kalliopi-hero-exterior-facade-01-331.webp",
        subtitle: "Stone House • Sleeps 4",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "monastiri",
        type: "house",
        group: "mavrikiano",
        title: "Monastiri",
        slug: "monastiri",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.2666111,
        lng: 25.7191111,
        googleMapsUrl: "https://goo.gl/maps/hggQAnymcFkZuG7y8",
        image: "/images/houses/monastiri/480/monastiri-hero-exterior-facade-01-480.webp",
        subtitle: "Stone House • Private Pool • Sleeps 6",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "private-car-parking",
        type: "parking",
        group: "mavrikiano",
        title: "Private Car Parking",
        slug: "private-car-parking",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.2670833,
        lng: 25.7188333,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35.2670833,25.7188333",
        image: "/images/brand/eh-mark-512.png",
        subtitle: "Mavrikiano, Elounda",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    },
    {
        id: "almond-tree-villa",
        type: "villa",
        group: "vrouchas",
        title: "Almond Tree Villa",
        slug: "almond-tree-villa",
        locationLabel: "Vrouchas, Elounda",
        lat: 35.31655871183121,
        lng: 25.734394108452083,
        googleMapsUrl: "https://goo.gl/maps/xNj5fxp2RWKeokaAA",
        image: "/images/villa/almond-tree-villa/480/almond-tree-villa-hero-outdoor-dining-terrace-02-480.webp",
        subtitle: "Luxury Villa • Private Pool • Sleeps 10",
        needsVerification: false,
        coordinateSource: "direct",
        source: "manual verification"
    }
]

export const housesOnly = locations.filter((item) => item.type === "house")
export const mavrikianoHouses = locations.filter((item) => item.type === "house" && item.group === "mavrikiano")
export const villaOnly = locations.filter((item) => item.type === "villa")
export const parkingOnly = locations.filter((item) => item.type === "parking")
export const verifiedLocations = locations.filter((item) => item.needsVerification === false)
