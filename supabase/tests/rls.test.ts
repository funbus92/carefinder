/**
 * Supabase RLS policy verification helper.
 * Run with: npx vitest run supabase/tests/rls.test.ts
 * Requires VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and test user credentials.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? ''
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? ''
const testUserEmail = process.env.TEST_USER_EMAIL ?? ''
const testUserPassword = process.env.TEST_USER_PASSWORD ?? ''

const skip = !supabaseUrl || !anonKey || !testUserEmail

describe.skipIf(skip)('RLS policies', () => {
  const supabase = createClient(supabaseUrl, anonKey)

  beforeAll(async () => {
    await supabase.auth.signInWithPassword({
      email: testUserEmail,
      password: testUserPassword,
    })
  })

  it('allows public read on hospitals', async () => {
    const { data, error } = await supabase.from('hospitals').select('id').limit(1)
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('blocks non-admin insert on hospitals', async () => {
    const { error } = await supabase.from('hospitals').insert({
      name: 'RLS Test',
      address: 'Test Address',
      city: 'Lagos',
      lga: 'Test',
      phone: '08012345678',
      specialties: ['general'],
      ownership_type: 'public',
      latitude: 6.5,
      longitude: 3.4,
      location: 'POINT(3.4 6.5)',
    })
    expect(error).not.toBeNull()
    expect(error?.code).toBe('42501')
  })
})
