const EARTH_RADIUS_KM = 6371

/** Haversine distance between two lat/lng points in kilometres. */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Filter hospitals within a given radius (km) of a centre point. */
export function filterByRadius<T extends { latitude: number; longitude: number }>(
  hospitals: T[],
  lat: number,
  lng: number,
  radiusKm: number,
): (T & { distance_km: number })[] {
  return hospitals
    .map((h) => ({
      ...h,
      distance_km: haversineDistanceKm(lat, lng, h.latitude, h.longitude),
    }))
    .filter((h) => h.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km)
}

/** Validate coordinate bounds for Nigeria (approximate). */
export function isValidNigeriaCoordinate(lat: number, lng: number): boolean {
  return lat >= 4 && lat <= 14 && lng >= 2.5 && lng <= 15
}
