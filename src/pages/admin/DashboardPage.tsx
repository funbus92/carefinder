import { Building2, MessageSquare, Star } from 'lucide-react'

export function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage hospital entries, moderate reviews, and invite new admins.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Building2, label: 'Hospitals', desc: 'Create and edit hospital entries' },
          { icon: MessageSquare, label: 'Reviews', desc: 'Approve or hide user reviews' },
          { icon: Star, label: 'Ratings', desc: 'Monitor aggregate ratings' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <Icon className="h-8 w-8 text-primary-600" />
            <h3 className="mt-3 font-semibold">{label}</h3>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
