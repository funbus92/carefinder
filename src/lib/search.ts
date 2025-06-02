import type { Hospital, SearchFilters, Specialty, OwnershipType } from './types'
import { filterByRadius } from './postgis'

export function matchesTextQuery(hospital: Hospital, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    hospital.name.toLowerCase().includes(q) ||
    hospital.city.toLowerCase().includes(q) ||
    hospital.lga.toLowerCase().includes(q) ||
    hospital.address.toLowerCase().includes(q)
  )
}

export function matchesSpecialty(hospital: Hospital, specialty?: Specialty): boolean {
  if (!specialty) return true
  return hospital.specialties.includes(specialty)
}

export function matchesOwnership(
  hospital: Hospital,
  ownership?: OwnershipType,
): boolean {
  if (!ownership) return true
  return hospital.ownership_type === ownership
}

export function matchesCity(hospital: Hospital, city?: string): boolean {
  if (!city) return true
  return hospital.city.toLowerCase() === city.trim().toLowerCase()
}

export function matchesLga(hospital: Hospital, lga?: string): boolean {
  if (!lga) return true
  return hospital.lga.toLowerCase() === lga.trim().toLowerCase()
}

/** Client-side filter logic mirroring server-side search params. */
export function filterHospitals(
  hospitals: Hospital[],
  filters: SearchFilters,
): Hospital[] {
  let results = hospitals.filter(
    (h) =>
      matchesTextQuery(h, filters.query ?? '') &&
      matchesCity(h, filters.city) &&
      matchesLga(h, filters.lga) &&
      matchesSpecialty(h, filters.specialty) &&
      matchesOwnership(h, filters.ownership),
  )

  if (
    filters.radius &&
    filters.lat !== undefined &&
    filters.lng !== undefined
  ) {
    results = filterByRadius(results, filters.lat, filters.lng, filters.radius)
  }

  return results
}

export function parseSearchParams(params: URLSearchParams): SearchFilters {
  const lat = params.get('lat')
  const lng = params.get('lng')
  const radius = params.get('radius')

  return {
    query: params.get('q') ?? undefined,
    city: params.get('city') ?? undefined,
    lga: params.get('lga') ?? undefined,
    specialty: (params.get('specialty') as SearchFilters['specialty']) ?? undefined,
    ownership: (params.get('ownership') as SearchFilters['ownership']) ?? undefined,
    radius: radius ? Number(radius) : undefined,
    lat: lat ? Number(lat) : undefined,
    lng: lng ? Number(lng) : undefined,
  }
}

export function buildShareUrl(filters: SearchFilters, baseUrl?: string): string {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.city) params.set('city', filters.city)
  if (filters.lga) params.set('lga', filters.lga)
  if (filters.specialty) params.set('specialty', filters.specialty)
  if (filters.ownership) params.set('ownership', filters.ownership)
  if (filters.radius) params.set('radius', String(filters.radius))
  if (filters.lat !== undefined) params.set('lat', String(filters.lat))
  if (filters.lng !== undefined) params.set('lng', String(filters.lng))

  const origin = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const qs = params.toString()
  return `${origin}/search${qs ? `?${qs}` : ''}`
}
