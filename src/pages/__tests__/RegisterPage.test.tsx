import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RegisterPage } from '../RegisterPage'
import { AuthProvider } from '../../contexts/AuthContext'

describe('RegisterPage', () => {
  it('renders registration form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })
})
