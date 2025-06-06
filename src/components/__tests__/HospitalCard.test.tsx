import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HospitalCard } from '../HospitalCard'
import { MOCK_HOSPITALS } from '../../data/mock-hospitals'

describe('HospitalCard', () => {
  it('renders hospital name and rating', () => {
    const hospital = MOCK_HOSPITALS[0]
    render(
      <MemoryRouter>
        <HospitalCard hospital={hospital} />
      </MemoryRouter>,
    )
    expect(screen.getByText(hospital.name)).toBeInTheDocument()
    expect(screen.getByText(hospital.rating_avg.toFixed(1))).toBeInTheDocument()
  })

  it('displays specialties as tags', () => {
    const hospital = MOCK_HOSPITALS[0]
    render(
      <MemoryRouter>
        <HospitalCard hospital={hospital} />
      </MemoryRouter>,
    )
    hospital.specialties.forEach((s) => {
      expect(screen.getByText(s)).toBeInTheDocument()
    })
  })
})
