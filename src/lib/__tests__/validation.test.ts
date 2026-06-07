import { describe, it, expect } from 'vitest'
import { signUpSchema } from '../validation'

describe('signUpSchema', () => {
  it('accepts valid registration data', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short passwords', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})
