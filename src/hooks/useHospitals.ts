import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { filterHospitals } from '../lib/search'
import { MOCK_HOSPITALS } from '../data/mock-hospitals'
import type { Hospital, SearchFilters } from '../lib/types'

export function useHospitals(filters: SearchFilters) {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHospitals = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isSupabaseConfigured()) {
        setHospitals(filterHospitals(MOCK_HOSPITALS, filters))
        setLoading(false)
        return
      }

      if (filters.radius && filters.lat !== undefined && filters.lng !== undefined) {
        const { data, error: rpcError } = await supabase.rpc('hospitals_within_radius', {
          lat: filters.lat,
          lng: filters.lng,
          radius_km: filters.radius,
        })
        if (rpcError) throw rpcError
        let results = (data as Hospital[]) ?? []
        results = filterHospitals(results, { ...filters, radius: undefined, lat: undefined, lng: undefined })
        setHospitals(results)
      } else {
        let query = supabase.from('hospitals').select('*')

        if (filters.city) query = query.ilike('city', filters.city)
        if (filters.lga) query = query.ilike('lga', filters.lga)
        if (filters.specialty) query = query.contains('specialties', [filters.specialty])
        if (filters.ownership) query = query.eq('ownership_type', filters.ownership)
        if (filters.query) {
          query = query.or(
            `name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,lga.ilike.%${filters.query}%`,
          )
        }

        const { data, error: fetchError } = await query
        if (fetchError) throw fetchError
        setHospitals((data as Hospital[]) ?? [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load hospitals')
      setHospitals(filterHospitals(MOCK_HOSPITALS, filters))
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchHospitals()
  }, [fetchHospitals])

  return { hospitals, loading, error, refetch: fetchHospitals }
}

export async function fetchHospitalById(id: string): Promise<Hospital | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_HOSPITALS.find((h) => h.id === id) ?? null
  }

  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return MOCK_HOSPITALS.find((h) => h.id === id) ?? null
  return data as Hospital
}
