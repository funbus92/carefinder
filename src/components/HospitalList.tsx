import type { Hospital } from '../lib/types'
import { HospitalCard } from './HospitalCard'

interface HospitalListProps {
  hospitals: Hospital[]
  loading?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  sortBy?: 'name' | 'rating' | 'distance'
}

export function HospitalList({
  hospitals,
  loading,
  selectedIds,
  onToggleSelect,
  sortBy = 'name',
}: HospitalListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  if (hospitals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No hospitals found. Try adjusting your search filters.
      </div>
    )
  }

  const sorted = [...hospitals].sort((a, b) => {
    if (sortBy === 'rating') return b.rating_avg - a.rating_avg
    if (sortBy === 'distance') {
      return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity)
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-3">
      {sorted.map((h) => (
        <HospitalCard
          key={h.id}
          hospital={h}
          selected={selectedIds?.has(h.id)}
          onSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}
