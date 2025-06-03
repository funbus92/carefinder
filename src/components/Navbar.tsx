import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogIn, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Navbar() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary-700">
          <Heart className="h-6 w-6 fill-primary-500 text-primary-500" />
          <span>Carefinder</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/search" className="text-sm font-medium text-gray-600 hover:text-primary-600">
            Find Hospitals
          </Link>

          {role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-600"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
