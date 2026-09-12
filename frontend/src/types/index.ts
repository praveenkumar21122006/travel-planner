export type TimeSlot = "morning" | "afternoon" | "evening";

export const TIME_SLOT_ORDER: TimeSlot[] = ["morning", "afternoon", "evening"];

export interface User {
  id: string;
  email: string;
}

export interface Activity {
  id: string;
  tripId: string;
  dayNumber: number;
  timeSlot: TimeSlot;
  title: string;
  description: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  destinationCity: string;
  country: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  activities?: Activity[];
}

export interface TripDraft {
  destinationCity: string;
  country: string;
  startDate: string;
  endDate: string;
}

export interface ActivityDraft {
  dayNumber: number;
  timeSlot: TimeSlot;
  title: string;
  description: string;
}

export interface WeatherDay {
  date: string;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface ForecastResponse {
  city: string;
  country: string;
  unit: "metric";
  days: WeatherDay[];
}

export interface CitySuggestion {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CitySearchResponse {
  suggestions: CitySuggestion[];
  provider: "amadeus" | "geonames" | "embedded";
}

export interface AuthResponse {
  token: string;
  user: User;
}