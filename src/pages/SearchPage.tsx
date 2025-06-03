import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Share2 } from 'lucide-react'
import { SearchBar } from '../components/SearchBar'
import { HospitalList } from '../components/HospitalList'
import { HospitalMap } from '../components/HospitalMap'
import { CsvExportModal } from '../components/CsvExportModal'
import { ShareModal } from '../components/ShareModal'
import { useHospitals } from '../hooks/useHospitals'
import { useGeolocation } from '../hooks/useGeolocation'
import { parseSearchParams } from '../lib/search'
import type { SearchFilters } from '../lib/types'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams])
  const { hospitals, loading } = useHospitals(filters)
  const { position, loading: geoLoading, requestLocation } = useGeolocation()

  const [showExport, setShowExport] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'distance'>(
    filters.radius ? 'distance' : 'name',
  )

  useEffect(() => {
    if (position && filters.radius) {
      const next = new URLSearchParams(searchParams)
      next.set('lat', String(position.lat))
      next.set('lng', String(position.lng))
      setSearchParams(next, { replace: true })
    }
  }, [position]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (newFilters: SearchFilters) => {
    const params = new URLSearchParams()
    if (newFilters.query) params.set('q', newFilters.query)
    if (newFilters.city) params.set('city', newFilters.city)
    if (newFilters.lga) params.set('lga', newFilters.lga)
    if (newFilters.specialty) params.set('specialty', newFilters.specialty)
    if (newFilters.ownership) params.set('ownership', newFilters.ownership)
    if (newFilters.radius) params.set('radius', String(newFilters.radius))
    if (newFilters.lat !== undefined) params.set('lat', String(newFilters.lat))
    if (newFilters.lng !== undefined) params.set('lng', String(newFilters.lng))
    setSearchParams(params)
  }

  const handleUseLocation = () => {
    requestLocation()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const mapCenter =
    filters.lat !== undefined && filters.lng !== undefined
      ? { lat: filters.lat, lng: filters.lng }
      : undefined

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <SearchBar
        filters={filters}
        onSearch={handleSearch}
        onUseLocation={handleUseLocation}
        locationLoading={geoLoading}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {loading ? 'Searching...' : `${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''} found`}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="name">Sort by name</option>
            <option value="rating">Sort by rating</option>
            {filters.radius && <option value="distance">Sort by distance</option>}
          </select>
          <button
            onClick={() => setShowExport(true)}
            disabled={hospitals.length === 0}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="h-[500px] overflow-hidden rounded-lg border border-gray-200">
          <HospitalMap
            hospitals={hospitals}
            center={mapCenter}
            radiusKm={filters.radius}
          />
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <HospitalList
            hospitals={hospitals}
            loading={loading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            sortBy={sortBy}
          />
        </div>
      </div>

      {showExport && (
        <CsvExportModal
          hospitals={hospitals}
          filters={filters}
          onClose={() => setShowExport(false)}
        />
      )}
      {showShare && (
        <ShareModal
          hospitals={hospitals}
          filters={filters}
          selectedIds={selectedIds}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
