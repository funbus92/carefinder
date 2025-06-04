import { useState } from 'react'
import { Check, Copy, Mail, X } from 'lucide-react'
import type { Hospital, SearchFilters } from '../lib/types'
import { buildShareUrl } from '../lib/search'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface ShareModalProps {
  hospitals: Hospital[]
  filters: SearchFilters
  selectedIds: Set<string>
  onClose: () => void
}

export function ShareModal({
  hospitals,
  filters,
  selectedIds,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const shareUrl = buildShareUrl(filters)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedHospitals = hospitals.filter((h) => selectedIds.has(h.id))

  const handleEmailShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || selectedHospitals.length === 0) return

    if (!isSupabaseConfigured()) {
      setMessage(`Would send ${selectedHospitals.length} hospitals to ${email} (demo mode)`)
      return
    }

    setSending(true)
    const { error } = await supabase.functions.invoke('share-hospitals', {
      body: {
        recipientEmail: email,
        hospitals: selectedHospitals.map((h) => ({
          name: h.name,
          address: h.address,
          phone: h.phone,
          rating: h.rating_avg,
        })),
      },
    })

    setSending(false)
    setMessage(error ? error.message : 'Email sent successfully!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share Hospitals</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Shareable link
          </label>
          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleEmailShare} className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Email a curated list ({selectedHospitals.length} selected)
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="recipient@example.com"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={sending || selectedHospitals.length === 0}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send via email'}
          </button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </form>
      </div>
    </div>
  )
}
