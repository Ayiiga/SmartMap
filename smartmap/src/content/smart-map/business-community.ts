export interface BusinessListing {
  id: string;
  name: string;
  category: string;
  claimed: boolean;
  verified: boolean;
  premium: boolean;
  sponsored: boolean;
  views: number;
  calls: number;
  directions: number;
  rating: number;
}

export interface CommunityGroup {
  id: string;
  name: string;
  type: "neighborhood_watch" | "safety_volunteers" | "local_group";
  members: number;
  area: string;
}

export interface CommunityAnnouncement {
  id: string;
  title: string;
  body: string;
  area: string;
  createdAt: string;
}

export interface PlaceReview {
  id: string;
  placeName: string;
  rating: number;
  text: string;
  helpfulVotes: number;
  hasImage: boolean;
  hasVideo: boolean;
  reported: boolean;
}

export const SAMPLE_BUSINESSES: BusinessListing[] = [
  {
    id: "biz-1",
    name: "Ernest Chemists — Osu",
    category: "Pharmacy",
    claimed: true,
    verified: true,
    premium: true,
    sponsored: false,
    views: 1240,
    calls: 86,
    directions: 210,
    rating: 4.6,
  },
  {
    id: "biz-2",
    name: "Shell — Spintex",
    category: "Fuel",
    claimed: true,
    verified: true,
    premium: false,
    sponsored: true,
    views: 980,
    calls: 40,
    directions: 320,
    rating: 4.3,
  },
  {
    id: "biz-3",
    name: "Buka Restaurant",
    category: "Restaurant",
    claimed: false,
    verified: false,
    premium: false,
    sponsored: false,
    views: 540,
    calls: 22,
    directions: 95,
    rating: 4.5,
  },
];

export const SAMPLE_GROUPS: CommunityGroup[] = [
  {
    id: "grp-1",
    name: "East Legon Neighborhood Watch",
    type: "neighborhood_watch",
    members: 128,
    area: "East Legon",
  },
  {
    id: "grp-2",
    name: "Accra Safety Volunteers",
    type: "safety_volunteers",
    members: 64,
    area: "Greater Accra",
  },
  {
    id: "grp-3",
    name: "Osu Local Traders",
    type: "local_group",
    members: 210,
    area: "Osu",
  },
];

export const SAMPLE_ANNOUNCEMENTS: CommunityAnnouncement[] = [
  {
    id: "ann-1",
    title: "Street lighting repair schedule",
    body: "AMA crews will repair lights along Liberation Road this weekend.",
    area: "Ridge",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "ann-2",
    title: "Community clean-up",
    body: "Join safety volunteers for a Sunday morning clean-up near Makola.",
    area: "Makola",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

export const SAMPLE_REVIEWS: PlaceReview[] = [
  {
    id: "rev-1",
    placeName: "Korle Bu Teaching Hospital",
    rating: 4,
    text: "Emergency desk was helpful. Expect queues in the morning.",
    helpfulVotes: 18,
    hasImage: true,
    hasVideo: false,
    reported: false,
  },
  {
    id: "rev-2",
    placeName: "Circle Bus Terminal",
    rating: 3,
    text: "Busy but organized during peak hours.",
    helpfulVotes: 7,
    hasImage: false,
    hasVideo: true,
    reported: false,
  },
  {
    id: "rev-3",
    placeName: "Fake Promo Spot",
    rating: 5,
    text: "BUY NOW CLICK LINK http://spam.example WIN PRIZE!!!",
    helpfulVotes: 0,
    hasImage: false,
    hasVideo: false,
    reported: true,
  },
];
