import { describe, it, expect } from 'vitest'
import {
  hospitalToCsvRow,
  buildCsvFilename,
  exportHospitalsToCsv,
} from '../csv-export'
import type { Hospital } from '../types'

const sampleHospital: Hospital = {
  id: '1',
  name: 'Test Hospital',
  address: '123 Main St',
  city: 'Lagos',
  lga: 'Surulere',
  phone: '08012345678',
  email: 'test@hospital.ng',
  specialties: ['maternity', 'emergency'],
  ownership_type: 'public',
  visiting_hours: '',
  description: '',
  latitude: 6.5,
  longitude: 3.4,
  image_urls: [],
  rating_avg: 4.3,
  rating_count: 10,
  created_at: '2025-01-01',
  updated_at: '2025-01-01',
}

describe('csv-export', () => {
  it('selects only requested columns', () => {
    const row = hospitalToCsvRow(sampleHospital, ['name', 'phone'])
    expect(row).toEqual({ name: 'Test Hospital', phone: '08012345678' })
    expect(row).not.toHaveProperty('address')
  })

  it('formats specialties as semicolon-separated string', () => {
    const row = hospitalToCsvRow(sampleHospital, ['specialties'])
    expect(row.specialties).toBe('maternity; emergency')
  })

  it('builds traceable filename with query and date', () => {
    const filename = buildCsvFilename({ city: 'Lagos' })
    expect(filename).toMatch(/^hospitals-lagos-\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it('exports valid CSV with headers', () => {
    const csv = exportHospitalsToCsv([sampleHospital], ['name', 'rating'])
    expect(csv).toContain('name,rating')
    expect(csv).toContain('Test Hospital')
    expect(csv).toContain('4.3')
  })
})
