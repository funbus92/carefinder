import { Link } from 'react-router-dom'
import { Search, MapPin, Download, Share2 } from 'lucide-react'

export function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find Healthcare in Nigeria
          </h1>
          <p className="mt-4 text-lg text-primary-100">
            Search, map, export, and share hospital information across Nigeria.
            Built for citizens who need reliable access to healthcare facilities.
          </p>
          <Link
            to="/search"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-lg hover:bg-primary-50"
          >
            <Search className="h-5 w-5" />
            Start Searching
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-gray-900">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              title: 'Search & Map',
              desc: 'Find hospitals by name, city, LGA, specialty, or within a radius of your location.',
            },
            {
              icon: Download,
              title: 'Export CSV',
              desc: 'Download filtered results with customizable columns — no server round-trip needed.',
            },
            {
              icon: Share2,
              title: 'Share',
              desc: 'Copy shareable links or email curated hospital lists to friends and family.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
