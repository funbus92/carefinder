import { useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { hospitalSchema, type HospitalFormData } from '../../lib/validation'
import type { Hospital, Specialty, OwnershipType } from '../../lib/types'
import { SPECIALTIES, OWNERSHIP_TYPES } from '../../lib/types'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

interface AdminEntryFormProps {
  hospital?: Hospital
  onSaved: () => void
  onCancel: () => void
}

const emptyForm: HospitalFormData = {
  name: '',
  address: '',
  city: '',
  lga: '',
  phone: '',
  email: '',
  specialties: [],
  ownership_type: 'public',
  visiting_hours: '',
  description: '',
  latitude: 6.5244,
  longitude: 3.3792,
}

export function AdminEntryForm({ hospital, onSaved, onCancel }: AdminEntryFormProps) {
  const [form, setForm] = useState<HospitalFormData>(
    hospital
      ? {
          name: hospital.name,
          address: hospital.address,
          city: hospital.city,
          lga: hospital.lga,
          phone: hospital.phone,
          email: hospital.email ?? '',
          specialties: hospital.specialties,
          ownership_type: hospital.ownership_type,
          visiting_hours: hospital.visiting_hours,
          description: hospital.description,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(hospital?.image_urls ?? [])

  const update = (patch: Partial<HospitalFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const toggleSpecialty = (s: Specialty) => {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isSupabaseConfigured()) return

    setUploading(true)
    const path = `hospitals/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('hospital-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('hospital-images').getPublicUrl(path)
      setImageUrls((prev) => [...prev, data.publicUrl])
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = hospitalSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? 'form'
        fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSaving(true)

    const payload = {
      ...parsed.data,
      email: parsed.data.email || null,
      image_urls: imageUrls,
      location: `POINT(${parsed.data.longitude} ${parsed.data.latitude})`,
    }

    if (!isSupabaseConfigured()) {
      setSaving(false)
      onSaved()
      return
    }

    if (hospital) {
      const { error } = await supabase
        .from('hospitals')
        .update(payload)
        .eq('id', hospital.id)
      if (error) setErrors({ form: error.message })
      else onSaved()
    } else {
      const { error } = await supabase.from('hospitals').insert(payload)
      if (error) setErrors({ form: error.message })
      else onSaved()
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-color-mode="light">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *" error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            className="field-input"
          />
        </Field>
        <Field label="Phone *" error={errors.phone}>
          <input
            value={form.phone}
            onChange={(e) => update({ phone: e.target.value })}
            className="field-input"
            placeholder="08012345678"
          />
        </Field>
        <Field label="Address *" error={errors.address} className="sm:col-span-2">
          <input
            value={form.address}
            onChange={(e) => update({ address: e.target.value })}
            className="field-input"
          />
        </Field>
        <Field label="City *" error={errors.city}>
          <input
            value={form.city}
            onChange={(e) => update({ city: e.target.value })}
            className="field-input"
          />
        </Field>
        <Field label="LGA *" error={errors.lga}>
          <input
            value={form.lga}
            onChange={(e) => update({ lga: e.target.value })}
            className="field-input"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            className="field-input"
          />
        </Field>
        <Field label="Ownership *" error={errors.ownership_type}>
          <select
            value={form.ownership_type}
            onChange={(e) => update({ ownership_type: e.target.value as OwnershipType })}
            className="field-input"
          >
            {OWNERSHIP_TYPES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Latitude *" error={errors.latitude}>
          <input
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => update({ latitude: Number(e.target.value) })}
            className="field-input"
          />
        </Field>
        <Field label="Longitude *" error={errors.longitude}>
          <input
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => update({ longitude: Number(e.target.value) })}
            className="field-input"
          />
        </Field>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Specialties *
        </label>
        {errors.specialties && (
          <p className="mb-1 text-xs text-red-600">{errors.specialties}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                form.specialties.includes(s)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Visiting Hours (Markdown)
        </label>
        <MDEditor
          value={form.visiting_hours}
          onChange={(v: string | undefined) => update({ visiting_hours: v ?? '' })}
          height={150}
          preview="edit"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description (Markdown)
        </label>
        <MDEditor
          value={form.description}
          onChange={(v: string | undefined) => update({ description: v ?? '' })}
          height={200}
          preview="live"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Facility Images
        </label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {imageUrls.length > 0 && (
          <div className="mt-2 flex gap-2">
            {imageUrls.map((url) => (
              <img key={url} src={url} alt="" className="h-16 w-16 rounded object-cover" />
            ))}
          </div>
        )}
      </div>

      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : hospital ? 'Update Hospital' : 'Create Hospital'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-5 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <style>{`.field-input { width: 100%; border-radius: 0.5rem; border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; font-size: 0.875rem; }`}</style>
    </div>
  )
}
