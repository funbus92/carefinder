import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { AdminLayout } from './components/admin/AdminLayout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { HospitalDetailPage } from './pages/HospitalDetailPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { HospitalsPage } from './pages/admin/HospitalsPage'
import { ReviewsPage } from './pages/admin/ReviewsPage'
import { AdminInvitePage } from './pages/admin/AdminInvitePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="hospitals/:id" element={<HospitalDetailPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="hospitals" element={<HospitalsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="invite" element={<AdminInvitePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
