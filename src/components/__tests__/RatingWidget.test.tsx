import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RatingWidget } from '../RatingWidget'
import { AuthProvider } from '../../contexts/AuthContext'

describe('RatingWidget', () => {
  it('displays current average rating', () => {
    render(
      <AuthProvider>
        <RatingWidget hospitalId="1" currentAvg={4.2} currentCount={50} />
      </AuthProvider>,
    )
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('(50 reviews)')).toBeInTheDocument()
  })

  it('prompts sign-in when user is not authenticated', () => {
    render(
      <AuthProvider>
        <RatingWidget hospitalId="1" currentAvg={3.5} currentCount={10} />
      </AuthProvider>,
    )
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
