import { describe, it, expect } from 'vitest'
import { haversineDistanceKm, filterByRadius, isValidNigeriaCoordinate } from '../postgis'

describe('postgis', () => {
  it('calculates haversine distance between two points', () => {
    const lagos = { lat: 6.5244, lng: 3.3792 }
    const nearby = { lat: 6.4969, lng: 3.3584 }
    const distance = haversineDistanceKm(lagos.lat, lagos.lng, nearby.lat, nearby.lng)
    expect(distance).toBeGreaterThan(3)
    expect(distance).toBeLessThan(5)
  })

  it('filters hospitals within radius', () => {
    const hospitals = [
      { id: '1', latitude: 6.5244, longitude: 3.3792 },
      { id: '2', latitude: 9.0579, longitude: 7.4951 },
      { id: '3', latitude: 6.4969, longitude: 3.3584 },
    ]
    const results = filterByRadius(hospitals, 6.5244, 3.3792, 10)
    expect(results).toHaveLength(2)
    expect(results.every((r) => r.distance_km <= 10)).toBe(true)
    expect(results[0].distance_km).toBeLessThanOrEqual(results[1].distance_km)
  })

  it('validates Nigeria coordinate bounds', () => {
    expect(isValidNigeriaCoordinate(6.5244, 3.3792)).toBe(true)
    expect(isValidNigeriaCoordinate(51.5, -0.1)).toBe(false)
  })
})
