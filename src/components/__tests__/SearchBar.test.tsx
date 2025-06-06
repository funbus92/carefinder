import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  it('renders search input', () => {
    render(
      <SearchBar filters={{}} onSearch={vi.fn()} onUseLocation={vi.fn()} />,
    )
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument()
  })

  it('calls onSearch with filters on submit', async () => {
    const onSearch = vi.fn()
    render(
      <SearchBar filters={{}} onSearch={onSearch} onUseLocation={vi.fn()} />,
    )
    const input = screen.getByPlaceholderText(/search by name/i)
    await userEvent.type(input, 'LUTH')
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ query: 'LUTH' }))
  })

  it('shows filter panel when Filters clicked', async () => {
    render(
      <SearchBar filters={{}} onSearch={vi.fn()} onUseLocation={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /filters/i }))
    expect(screen.getByPlaceholderText('e.g. Lagos')).toBeInTheDocument()
  })
})
