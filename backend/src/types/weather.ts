export interface WeatherDay {
  date: string;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  readings?: number;
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