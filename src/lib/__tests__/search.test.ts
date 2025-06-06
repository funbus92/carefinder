import { describe, it, expect } from 'vitest'
import { filterHospitals, parseSearchParams, buildShareUrl } from '../search'
import { MOCK_HOSPITALS } from '../../data/mock-hospitals'

describe('search', () => {
  it('filters by city', () => {
    const results = filterHospitals(MOCK_HOSPITALS, { city: 'Lagos' })
    expect(results.every((h) => h.city === 'Lagos')).toBe(true)
    expect(results.length).toBeGreaterThan(0)
  })

  it('filters by specialty and ownership', () => {
    const results = filterHospitals(MOCK_HOSPITALS, {
      specialty: 'maternity',
      ownership: 'private',
    })
    expect(results.every(
      (h) => h.specialties.includes('maternity') && h.ownership_type === 'private',
    )).toBe(true)
  })

  it('parses human-readable search params', () => {
    const params = new URLSearchParams('city=Lagos&specialty=maternity&radius=10')
    const filters = parseSearchParams(params)
    expect(filters).toEqual({
      query: undefined,
      city: 'Lagos',
      lga: undefined,
      specialty: 'maternity',
      ownership: undefined,
      radius: 10,
      lat: undefined,
      lng: undefined,
    })
  })

  it('builds shareable URL with encoded filters', () => {
    const url = buildShareUrl(
      { city: 'Lagos', specialty: 'maternity', radius: 10 },
      'https://carefinder.app',
    )
    expect(url).toBe(
      'https://carefinder.app/search?city=Lagos&specialty=maternity&radius=10',
    )
  })
})
