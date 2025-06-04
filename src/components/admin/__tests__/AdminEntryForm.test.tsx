import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminEntryForm } from '../AdminEntryForm'

vi.mock('@uiw/react-md-editor', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="md-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

describe('AdminEntryForm', () => {
  it('renders required fields', () => {
    render(<AdminEntryForm onSaved={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/name/i)).toBeInTheDocument()
    expect(screen.getByText(/phone/i)).toBeInTheDocument()
    expect(screen.getByText(/address/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty submit', async () => {
    render(<AdminEntryForm onSaved={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /create hospital/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })
})
