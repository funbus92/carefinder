export type OwnershipType = 'public' | 'private'

export type Specialty =
  | 'maternity'
  | 'emergency'
  | 'dental'
  | 'pediatric'
  | 'general'
  | 'cardiology'
  | 'orthopedic'
  | 'ophthalmology'

export type ReviewStatus = 'pending' | 'approved' | 'hidden'

export type UserRole = 'admin' | 'user'

export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  lga: string
  phone: string
  email: string | null
  specialties: Specialty[]
  ownership_type: OwnershipType
  visiting_hours: string
  description: string
  latitude: number
  longitude: number
  image_urls: string[]
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
  distance_km?: number
}

export interface Review {
  id: string
  hospital_id: string
  user_id: string
  rating: number
  content: string | null
  status: ReviewStatus
  created_at: string
  user_email?: string
}

export interface SearchFilters {
  query?: string
  city?: string
  lga?: string
  specialty?: Specialty
  ownership?: OwnershipType
  radius?: number
  lat?: number
  lng?: number
}

export type CsvColumn =
  | 'name'
  | 'address'
  | 'phone'
  | 'email'
  | 'specialties'
  | 'rating'

export const CSV_COLUMNS: { key: CsvColumn; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'specialties', label: 'Specialties' },
  { key: 'rating', label: 'Rating' },
]

export const SPECIALTIES: Specialty[] = [
  'maternity',
  'emergency',
  'dental',
  'pediatric',
  'general',
  'cardiology',
  'orthopedic',
  'ophthalmology',
]

export const OWNERSHIP_TYPES: OwnershipType[] = ['public', 'private']
