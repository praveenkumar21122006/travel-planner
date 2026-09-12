export interface AuthUser {
  id: string;
  email: string;
}

export interface JWTPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

export type TimeSlot = "morning" | "afternoon" | "evening";

export interface ActivityDTO {
  id: string;
  tripId: string;
  dayNumber: number;
  timeSlot: TimeSlot;
  title: string;
  description: string;
  createdAt: string;
}

export interface TripDTO {
  id: string;
  userId: string;
  destinationCity: string;
  country: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  activities?: ActivityDTO[];
}