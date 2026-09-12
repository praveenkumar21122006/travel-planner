export type SafetyStatus = "safe" | "caution" | "advisory";

export type AttractionCategory = "nature" | "history" | "adventure";

export interface OriginRoute {
  origin: string;
  lat: number;
  lng: number;
  distanceKm: number;
  byCar: string;
  flight?: string;
  train?: string;
}

export interface Attraction {
  id: string;
  name: string;
  category: AttractionCategory;
  rating: number;
  reviews: number;
  fee: number;
  feeNote?: string;
  distanceKm: number;
  highlight: string;
}

export type AlertSeverity = "warning" | "info" | "advisory";

export interface EnRouteStop {
  id: string;
  name: string;
  category: AttractionCategory;
  rating: number;
  reviews: number;
  fee: number;
  feeNote?: string;
  distanceFromDestinationKm: number;
  highlight: string;
}

export interface DestinationAlert {
  kind: "weather" | "news";
  severity: AlertSeverity;
  title: string;
  detail: string;
}

export interface DestinationProfile {
  id: string;
  name: string;
  tagline: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  currencySymbol: string;
  currencyCode: string;
  defaultOrigin: string;
  safetyStatus: SafetyStatus;
  safetyNote: string;
  bodyOfWater: string;
  parkLabel: string;
  roadLabel: string;
  alerts: DestinationAlert[];
  enRoute: EnRouteStop[];
  attractions: Attraction[];
  origins: OriginRoute[];
}

export interface PlannedTrip {
  origin: string;
  destination: string;
  profile: DestinationProfile;
  route: OriginRoute;
  safetyStatus: SafetyStatus;
}

export interface SavedTripRecord {
  id: string;
  from: string;
  to: string;
  trip: PlannedTrip;
  addedIds: string[];
  savedAt: number;
}

export type AttractionTabKey = "all" | AttractionCategory;