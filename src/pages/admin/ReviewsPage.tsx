import { useState, useEffect } from 'react'
import { Check, EyeOff } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import type { Review } from '../../lib/types'

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    if (!isSupabaseConfigured()) {
      setReviews([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const moderate = async (id: string, status: 'approved' | 'hidden') => {
    if (!isSupabaseConfigured()) return
    await supabase.from('reviews').update({ status }).eq('id', id)
    load()
  }

  const pending = reviews.filter((r) => r.status === 'pending')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
      <p className="mt-1 text-sm text-gray-500">
        {pending.length} pending review{pending.length !== 1 ? 's' : ''}
      </p>

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-lg bg-gray-200" />
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      r.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700'
                        : r.status === 'approved'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.content && <p className="mt-2 text-sm text-gray-600">{r.content}</p>}
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => moderate(r.id, 'approved')}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => moderate(r.id, 'hidden')}
                    className="flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    Hide
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
