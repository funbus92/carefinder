import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export function AdminInvitePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    if (!isSupabaseConfigured()) {
      setMessage(`Would invite admin: ${email} (demo mode)`)
      setSubmitting(false)
      return
    }

    const { data, error } = await supabase.functions.invoke('invite-admin', {
      body: { email, password },
    })

    setSubmitting(false)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage(data?.message ?? 'Admin invited successfully')
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Invite Admin</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create new admin accounts. Admin registration is invite-only.
      </p>

      <form onSubmit={handleInvite} className="mt-8 max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Temporary Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-1 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          {submitting ? 'Inviting...' : 'Invite Admin'}
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </form>
    </div>
  )
}
