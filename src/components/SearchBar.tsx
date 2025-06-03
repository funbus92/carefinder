import { useState } from 'react'
import { Search, MapPin, Filter } from 'lucide-react'
import type { SearchFilters, Specialty, OwnershipType } from '../lib/types'
import { SPECIALTIES, OWNERSHIP_TYPES } from '../lib/types'

interface SearchBarProps {
  filters: SearchFilters
  onSearch: (filters: SearchFilters) => void
  onUseLocation: () => void
  locationLoading?: boolean
}

export function SearchBar({
  filters,
  onSearch,
  onUseLocation,
  locationLoading,
}: SearchBarProps) {
  const [local, setLocal] = useState<SearchFilters>(filters)
  const [showFilters, setShowFilters] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(local)
  }

  const update = (patch: Partial<SearchFilters>) => {
    setLocal((prev) => ({ ...prev, ...patch }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, city, or LGA..."
            value={local.query ?? ''}
            onChange={(e) => update({ query: e.target.value || undefined })}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Search
        </button>
      </div>

      {showFilters && (
        <div className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">City</label>
            <input
              type="text"
              value={local.city ?? ''}
              onChange={(e) => update({ city: e.target.value || undefined })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. Lagos"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">LGA</label>
            <input
              type="text"
              value={local.lga ?? ''}
              onChange={(e) => update({ lga: e.target.value || undefined })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. Surulere"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Specialty</label>
            <select
              value={local.specialty ?? ''}
              onChange={(e) =>
                update({ specialty: (e.target.value as Specialty) || undefined })
              }
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All specialties</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Ownership</label>
            <select
              value={local.ownership ?? ''}
              onChange={(e) =>
                update({ ownership: (e.target.value as OwnershipType) || undefined })
              }
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              {OWNERSHIP_TYPES.map((o) => (
                <option key={o} value={o}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Radius (km)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={local.radius ?? ''}
                onChange={(e) =>
                  update({ radius: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g. 10"
              />
            </div>
            <button
              type="button"
              onClick={onUseLocation}
              disabled={locationLoading}
              className="flex items-center gap-1 rounded-lg border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-50"
            >
              <MapPin className="h-4 w-4" />
              {locationLoading ? 'Locating...' : 'Use my location'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
