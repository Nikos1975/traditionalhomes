export type LocationItem = {
    id: string;
    type: "house" | "villa" | "parking";
    group: "mavrikiano" | "vrouchas";
    title: string;
    slug: string;
    locationLabel: string;
    lat: number | null;
    lng: number | null;
    googleMapsUrl: string | null;
    needsVerification: boolean;
    coordinateSource: "direct" | "fallback";
    source: string;
};

// NOTE: Erato, Penelope, and Kalliopi currently use temporary fallback coordinates 
// based on their neighboring houses. These must be replaced with true coordinates later.
export const locations: LocationItem[] = [
    {
        id: "margarita",
        type: "house",
        group: "mavrikiano",
        title: "Margarita",
        slug: "margarita",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266861693049584,
        lng: 25.719483092298287,
        googleMapsUrl: "https://goo.gl/maps/oBoYTAqEBQJRTb9P6",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    },
    {
        id: "leonidas",
        type: "house",
        group: "mavrikiano",
        title: "Leonidas",
        slug: "leonidas",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266785328912434,
        lng: 25.719376509973056,
        googleMapsUrl: "https://goo.gl/maps/PFL8D7ojmPa2GkYo8",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    },
    {
        id: "argyro",
        type: "house",
        group: "mavrikiano",
        title: "Argyro",
        slug: "argyro",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266710658804435,
        lng: 25.7196798338547,
        googleMapsUrl: "https://goo.gl/maps/W4dYTNibdcbtHaJKA",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    },
    {
        id: "clio",
        type: "house",
        group: "mavrikiano",
        title: "Clio",
        slug: "clio",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266963484473784,
        lng: 25.71868951845972,
        googleMapsUrl: "https://goo.gl/maps/8eZxC4NA9JQH8DFM7",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    },
    {
        id: "erato",
        type: "house",
        group: "mavrikiano",
        title: "Erato",
        slug: "erato",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.266963484473784,
        lng: 25.71868951845972,
        googleMapsUrl: null,
        needsVerification: true,
        coordinateSource: "fallback",
        source: "temporary fallback from Clio by user instruction"
    },
    {
        id: "demetra",
        type: "house",
        group: "mavrikiano",
        title: "Demetra",
        slug: "demetra",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26688687181016,
        lng: 25.718702190104686,
        googleMapsUrl: "https://goo.gl/maps/X3L8yFbk3W8YZCBK8",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    },
    {
        id: "penelope",
        type: "house",
        group: "mavrikiano",
        title: "Penelope",
        slug: "penelope",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26688687181016,
        lng: 25.718702190104686,
        googleMapsUrl: null,
        needsVerification: true,
        coordinateSource: "fallback",
        source: "temporary fallback from Demetra by user instruction"
    },
    {
        id: "monastiri",
        type: "house",
        group: "mavrikiano",
        title: "Monastiri",
        slug: "monastiri", // Updated from monastery to match route
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26660422590175,
        lng: 25.719061253661927,
        googleMapsUrl: "https://goo.gl/maps/hggQAnymcFkZuG7y8",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    },
    {
        id: "efterpi",
        type: "house",
        group: "mavrikiano",
        title: "Efterpi",
        slug: "efterpi",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26679934066996,
        lng: 25.718922801264526,
        googleMapsUrl: "https://maps.app.goo.gl/LyrmpEy4huy3RB4p8",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    },
    {
        id: "kalliopi",
        type: "house",
        group: "mavrikiano",
        title: "Kalliopi",
        slug: "kalliopi",
        locationLabel: "Mavrikiano, Elounda",
        lat: 35.26679934066996,
        lng: 25.718922801264526,
        googleMapsUrl: null,
        needsVerification: true,
        coordinateSource: "fallback",
        source: "temporary fallback from Efterpi by user instruction"
    },
    {
        id: "almond-tree-villa",
        type: "villa",
        group: "vrouchas",
        title: "Almond Tree Villa",
        slug: "almond-tree-villa", // Updated from almond-tree to match route
        locationLabel: "Vrouchas, Elounda",
        lat: 35.31656022432002,
        lng: 25.734323053810744,
        googleMapsUrl: "https://goo.gl/maps/xNj5fxp2RWKeokaAA",
        needsVerification: false,
        coordinateSource: "direct",
        source: "CSV"
    }
];

// Helper arrays
export const housesOnly = locations.filter(loc => loc.type === "house");
export const mavrikianoHouses = locations.filter(loc => loc.group === "mavrikiano" && loc.type === "house");
export const villaOnly = locations.filter(loc => loc.type === "villa");
export const verifiedLocations = locations.filter(loc => !loc.needsVerification);
export const locationsNeedingVerification = locations.filter(loc => loc.needsVerification);
