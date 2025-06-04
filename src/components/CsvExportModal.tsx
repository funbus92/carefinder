import { useState } from 'react'
import { Download, X } from 'lucide-react'
import type { CsvColumn, Hospital, SearchFilters } from '../lib/types'
import { CSV_COLUMNS } from '../lib/types'
import {
  buildCsvFilename,
  downloadCsv,
  exportHospitalsToCsv,
} from '../lib/csv-export'

interface CsvExportModalProps {
  hospitals: Hospital[]
  filters: SearchFilters
  onClose: () => void
}

export function CsvExportModal({ hospitals, filters, onClose }: CsvExportModalProps) {
  const [columns, setColumns] = useState<Set<CsvColumn>>(
    new Set(['name', 'address', 'phone', 'specialties', 'rating']),
  )

  const toggleColumn = (col: CsvColumn) => {
    setColumns((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col)
      else next.add(col)
      return next
    })
  }

  const handleExport = () => {
    const selected = CSV_COLUMNS.map((c) => c.key).filter((k) => columns.has(k))
    if (selected.length === 0) return
    const csv = exportHospitalsToCsv(hospitals, selected)
    const filename = buildCsvFilename(filters)
    downloadCsv(csv, filename)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Export to CSV</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Exporting {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''}. Select columns:
        </p>

        <div className="mb-6 space-y-2">
          {CSV_COLUMNS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={columns.has(key)}
                onChange={() => toggleColumn(key)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={columns.size === 0}
            className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </div>
    </div>
  )
}
