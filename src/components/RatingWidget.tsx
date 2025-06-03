import { useState } from 'react'
import { Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { reviewSchema } from '../lib/validation'

interface RatingWidgetProps {
  hospitalId: string
  currentAvg: number
  currentCount: number
  onSubmitted?: () => void
}

export function RatingWidget({
  hospitalId,
  currentAvg,
  currentCount,
  onSubmitted,
}: RatingWidgetProps) {
  const { user } = useAuth()
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setMessage('Please sign in to leave a review')
      return
    }

    const parsed = reviewSchema.safeParse({ rating: selected, content: content || undefined })
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? 'Invalid review')
      return
    }

    if (!isSupabaseConfigured()) {
      setMessage('Review submitted (demo mode)')
      setSelected(0)
      setContent('')
      onSubmitted?.()
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      hospital_id: hospitalId,
      user_id: user.id,
      rating: selected,
      content: content || null,
      status: 'pending',
    })

    setSubmitting(false)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Review submitted for moderation')
      setSelected(0)
      setContent('')
      onSubmitted?.()
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.round(currentAvg) ? 'fill-current' : 'text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-semibold">{currentAvg.toFixed(1)}</span>
        <span className="text-sm text-gray-400">({currentCount} reviews)</span>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Your rating</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const star = i + 1
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setSelected(star)}
                    className="text-amber-400 hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= (hovered || selected) ? 'fill-current' : 'text-gray-200'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Optional review (max 1000 chars)"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={selected === 0 || submitting}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-primary-600 hover:underline">
            Sign in
          </a>{' '}
          to leave a rating and review.
        </p>
      )}
    </div>
  )
}
