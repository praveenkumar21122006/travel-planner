import type { PlannedTrip, SavedTripRecord } from "../types/safeJourney";

const STORAGE_KEY = "tn-planner-saved-trips-v1";

export function loadSavedTrips(): SavedTripRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedTrips(list: SavedTripRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // storage full or unavailable — keep in-memory state
  }
}

export function upsertSavedTrip(
  list: SavedTripRecord[],
  trip: PlannedTrip,
  addedIds: string[]
): SavedTripRecord[] {
  const record: SavedTripRecord = {
    id: `${trip.origin}-${trip.destination}-${Date.now()}`,
    from: trip.origin,
    to: trip.destination,
    trip,
    addedIds,
    savedAt: Date.now(),
  };
  const idx = list.findIndex(
    (s) =>
      s.to.toLowerCase() === trip.destination.toLowerCase() &&
      s.from.toLowerCase() === trip.origin.toLowerCase()
  );
  if (idx >= 0) {
    const copy = [...list];
    copy[idx] = record;
    return copy;
  }
  return [record, ...list];
}