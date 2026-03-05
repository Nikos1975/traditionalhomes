export interface InventoryUnit {
  slug: string;
  type: 'house' | 'villa';
  name: string;
  location: string;
  area: string;
  sleeps_max: number;
  bedrooms: number;
  bathrooms: number;
  pool: 'private' | 'shared' | 'none';
  pool_notes: string | null;
  shared_pool_with: string[] | null;
  floors: number;
  internal_stairs: boolean;
  view: string;
  parking: string;
  wifi: boolean;
  pets: string;
  hard_constraints: string[];
  amenities: string[];
  access_detail: string | null;
  booking_id: string | null;
  availability_url: string;
  featured_image_alt: string;
  location_relations: {
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
}
