import { Link } from 'react-router-dom'
import { MapPin, Phone, Star } from 'lucide-react'
import type { Hospital } from '../lib/types'

interface HospitalCardProps {
  hospital: Hospital
  selected?: boolean
  onSelect?: (id: string) => void
}

export function HospitalCard({ hospital, selected, onSelect }: HospitalCardProps) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 transition-shadow hover:shadow-md ${
        selected ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Link
            to={`/hospitals/${hospital.id}`}
            className="text-base font-semibold text-gray-900 hover:text-primary-600"
          >
            {hospital.name}
          </Link>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              {hospital.address}, {hospital.lga}, {hospital.city}
            </span>
          </div>
        </div>
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(hospital.id)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600"
            aria-label={`Select ${hospital.name}`}
          />
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {hospital.specialties.map((s) => (
          <span
            key={s}
            className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700"
          >
            {s}
          </span>
        ))}
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            hospital.ownership_type === 'public'
              ? 'bg-green-50 text-green-700'
              : 'bg-purple-50 text-purple-700'
          }`}
        >
          {hospital.ownership_type}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="font-medium">{hospital.rating_avg.toFixed(1)}</span>
          <span className="text-gray-400">({hospital.rating_count})</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Phone className="h-3.5 w-3.5" />
          <span>{hospital.phone}</span>
        </div>
      </div>

      {hospital.distance_km !== undefined && (
        <p className="mt-1 text-xs text-gray-400">
          {hospital.distance_km.toFixed(1)} km away
        </p>
      )}
    </div>
  )
}
