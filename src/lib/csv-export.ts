import Papa from 'papaparse'
import type { CsvColumn, Hospital } from './types'

export function hospitalToCsvRow(
  hospital: Hospital,
  columns: CsvColumn[],
): Record<string, string> {
  const row: Record<string, string> = {}
  for (const col of columns) {
    switch (col) {
      case 'name':
        row.name = hospital.name
        break
      case 'address':
        row.address = hospital.address
        break
      case 'phone':
        row.phone = hospital.phone
        break
      case 'email':
        row.email = hospital.email ?? ''
        break
      case 'specialties':
        row.specialties = hospital.specialties.join('; ')
        break
      case 'rating':
        row.rating = hospital.rating_avg.toFixed(1)
        break
    }
  }
  return row
}

export function buildCsvFilename(filters: { query?: string; city?: string }): string {
  const slug = (filters.city ?? filters.query ?? 'all')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `hospitals-${slug}-${date}.csv`
}

export function exportHospitalsToCsv(
  hospitals: Hospital[],
  columns: CsvColumn[],
): string {
  const rows = hospitals.map((h) => hospitalToCsvRow(h, columns))
  return Papa.unparse(rows, { columns })
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
