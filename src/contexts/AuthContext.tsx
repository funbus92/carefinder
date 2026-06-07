import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { UserRole } from '../lib/types'

interface AuthResult {
  error: string | null
  needsEmailConfirmation?: boolean
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = async (userId: string) => {
    if (!isSupabaseConfigured()) return null
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()
    return (data?.role as UserRole) ?? 'user'
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session: s } }: { data: { session: Session | null } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        setRole(await fetchRole(s.user.id))
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, s: Session | null) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          setRole(await fetchRole(s.user.id))
        } else {
          setRole(null)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase is not configured. Add your env variables to sign in.' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase is not configured. Add your env variables to register.' }
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }

    const needsEmailConfirmation = !data.session
    return { error: null, needsEmailConfirmation }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
