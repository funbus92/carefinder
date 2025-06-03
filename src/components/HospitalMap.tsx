import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Hospital } from '../lib/types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

interface HospitalMapProps {
  hospitals: Hospital[]
  center?: { lat: number; lng: number }
  radiusKm?: number
  onHospitalClick?: (hospital: Hospital) => void
}

export function HospitalMap({
  hospitals,
  center,
  radiusKm,
  onHospitalClick,
}: HospitalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const defaultCenter: [number, number] = center
      ? [center.lng, center.lat]
      : [3.3792, 6.5244]

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: defaultCenter,
        zoom: center ? 11 : 5,
      })
      mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    } else if (center) {
      mapRef.current.flyTo({ center: defaultCenter, zoom: 11 })
    }

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    hospitals.forEach((h) => {
      const el = document.createElement('div')
      el.className =
        'h-4 w-4 rounded-full border-2 border-white bg-primary-600 shadow-md cursor-pointer'
      const marker = new mapboxgl.Marker(el)
        .setLngLat([h.longitude, h.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setHTML(
            `<strong>${h.name}</strong><br/><span style="font-size:12px;color:#666">${h.city}</span>`,
          ),
        )
        .addTo(mapRef.current!)

      if (onHospitalClick) {
        el.addEventListener('click', () => onHospitalClick(h))
      }

      markersRef.current.push(marker)
    })

    if (center && radiusKm && mapRef.current) {
      const sourceId = 'radius-circle'
      const layerId = 'radius-circle-fill'

      if (mapRef.current.getSource(sourceId)) {
        mapRef.current.removeLayer(layerId)
        mapRef.current.removeSource(sourceId)
      }

      const circle = createGeoCircle(center.lng, center.lat, radiusKm)
      mapRef.current.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'Feature', geometry: circle, properties: {} },
      })
      mapRef.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.1 },
      })
    }

    return () => {
      markersRef.current.forEach((m) => m.remove())
    }
  }, [hospitals, center, radiusKm, onHospitalClick])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500">
        Set VITE_MAPBOX_TOKEN to enable the map
      </div>
    )
  }

  return <div ref={mapContainer} className="h-full w-full rounded-lg" />
}

function createGeoCircle(lng: number, lat: number, radiusKm: number) {
  const points = 64
  const coords: [number, number][] = []
  const distanceX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))
  const distanceY = radiusKm / 110.574

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI
    coords.push([lng + distanceX * Math.cos(angle), lat + distanceY * Math.sin(angle)])
  }
  coords.push(coords[0])

  return { type: 'Polygon' as const, coordinates: [coords] }
}
