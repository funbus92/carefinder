import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { AdminEntryForm } from '../../components/admin/AdminEntryForm'
import { MOCK_HOSPITALS } from '../../data/mock-hospitals'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import type { Hospital } from '../../lib/types'

export function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [editing, setEditing] = useState<Hospital | null>(null)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    if (!isSupabaseConfigured()) {
      setHospitals(MOCK_HOSPITALS)
    } else {
      const { data } = await supabase.from('hospitals').select('*').order('name')
      setHospitals((data as Hospital[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hospital?')) return
    if (isSupabaseConfigured()) {
      await supabase.from('hospitals').delete().eq('id', id)
    }
    load()
  }

  if (creating || editing) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">
          {editing ? 'Edit Hospital' : 'New Hospital'}
        </h1>
        <AdminEntryForm
          hospital={editing ?? undefined}
          onSaved={() => {
            setCreating(false)
            setEditing(null)
            load()
          }}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hospitals</h1>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Hospital
        </button>
      </div>

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-lg bg-gray-200" />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">{h.name}</td>
                  <td className="px-4 py-3">{h.city}</td>
                  <td className="px-4 py-3 capitalize">{h.ownership_type}</td>
                  <td className="px-4 py-3">{h.rating_avg.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(h)}
                        className="text-gray-500 hover:text-primary-600"
                        aria-label={`Edit ${h.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="text-gray-500 hover:text-red-600"
                        aria-label={`Delete ${h.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
