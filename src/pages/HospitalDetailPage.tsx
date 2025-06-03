import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { fetchHospitalById } from '../hooks/useHospitals'
import { RatingWidget } from '../components/RatingWidget'
import { renderMarkdown } from '../lib/markdown'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Hospital, Review } from '../lib/types'

export function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const loadReviews = async (hospitalId: string) => {
    if (!isSupabaseConfigured()) return
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('hospital_id', hospitalId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) ?? [])
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchHospitalById(id).then((h) => {
      setHospital(h)
      if (h) loadReviews(h.id)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (!hospital) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-gray-500">Hospital not found.</p>
        <Link to="/search" className="mt-4 text-primary-600 hover:underline">
          Back to search
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/search"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">{hospital.name}</h1>

      <div className="mt-2 flex flex-wrap gap-2">
        {hospital.specialties.map((s) => (
          <span
            key={s}
            className="rounded-full bg-primary-50 px-3 py-0.5 text-sm text-primary-700"
          >
            {s}
          </span>
        ))}
        <span
          className={`rounded-full px-3 py-0.5 text-sm ${
            hospital.ownership_type === 'public'
              ? 'bg-green-50 text-green-700'
              : 'bg-purple-50 text-purple-700'
          }`}
        >
          {hospital.ownership_type}
        </span>
      </div>

      <div className="mt-6 space-y-3 text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {hospital.address}, {hospital.lga}, {hospital.city}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <a href={`tel:${hospital.phone}`} className="hover:text-primary-600">
            {hospital.phone}
          </a>
        </div>
        {hospital.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${hospital.email}`} className="hover:text-primary-600">
              {hospital.email}
            </a>
          </div>
        )}
      </div>

      {hospital.visiting_hours && (
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            Visiting Hours
          </h2>
          <div
            className="prose mt-2 max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(hospital.visiting_hours) }}
          />
        </div>
      )}

      {hospital.description && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">About</h2>
          <div
            className="prose mt-2 max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(hospital.description) }}
          />
        </div>
      )}

      {hospital.image_urls.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {hospital.image_urls.map((url) => (
            <img
              key={url}
              src={url}
              alt={hospital.name}
              className="h-32 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <RatingWidget
          hospitalId={hospital.id}
          currentAvg={hospital.rating_avg}
          currentCount={hospital.rating_count}
          onSubmitted={() => loadReviews(hospital.id)}
        />
      </div>

      {reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Reviews</h2>
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                {r.content && <p className="mt-2 text-sm text-gray-600">{r.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
