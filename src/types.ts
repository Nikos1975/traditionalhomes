export interface InventoryUnit {
  slug: string;
  type: 'house' | 'villa';
  name: string;
  location: string;
  area: string;
  sleeps: number;
  bedrooms: number;
  bathrooms: number;
  pool: 'private' | 'shared' | 'none';
  poolNotes: string | null;
  sharedPoolWith: string[] | null;
  floors: number;
  internalStairs: boolean;
  view: string;
  parking: string;
  wifi: boolean;
  pets: string;
  hardConstraints: string[];
  amenities: string[];
  accessDetail: string | null;
  bookingId: string | null;
  availabilityUrl: string;
  featuredImageAlt: string;
  locationRelations: {
    near: string[] | null;
    above: string | null;
    below: string | null;
  };
}

export interface GalleryImage {
  src: string;
  alt: string;
  isFeatured: boolean;
  tags?: string[];
  srcset?: string;
}

export interface SiteCopy {
  accessNoteShort: string;
  accessNoteFull: string;
  accessAnchorUrl: string;
  bookingEngineUrl: string;
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  socialHandle: string;
  wifi: string;
  pets: string;
  checkIn: string;
  checkOut: string;
  quietHours: string;
  cancellationPolicy: string;
  heroHeadline: string;
  heroSubline: string;
  metaDescriptionHome: string;
  metaDescriptionHouses: string;
  metaDescriptionLocation: string;
  metaDescriptionFaq: string;
  metaDescriptionPolicies: string;
  metaDescriptionAbout: string;
  metaDescriptionContact: string;
  arrival: {
    hostName: string;
    meetingPoint: string;
    instructions: string;
    earlyArrival: string;
  };
}
