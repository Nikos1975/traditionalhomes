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
        googleMapsUrl: null,
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
        googleMapsUrl: null,
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
        googleMapsUrl: null,
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
