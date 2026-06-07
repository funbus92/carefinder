import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Hospital } from '../lib/types'

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
  const mapRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const radiusLayerRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    const defaultCenter: L.LatLngExpression = center
      ? [center.lat, center.lng]
      : [6.5244, 3.3792]

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainer.current, {
        center: defaultCenter,
        zoom: center ? 11 : 6,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current)

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current)
    } else if (center) {
      mapRef.current.setView(defaultCenter, 11)
    }

    markersLayerRef.current?.clearLayers()

    hospitals.forEach((h) => {
      const marker = L.circleMarker([h.latitude, h.longitude], {
        radius: 8,
        fillColor: '#2563eb',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      })
        .bindPopup(
          `<strong>${escapeHtml(h.name)}</strong><br/>
           <span style="font-size:12px;color:#666">${escapeHtml(h.city)}</span>`,
        )
        .addTo(markersLayerRef.current!)

      if (onHospitalClick) {
        marker.on('click', () => onHospitalClick(h))
      }
    })

    if (radiusLayerRef.current) {
      radiusLayerRef.current.remove()
      radiusLayerRef.current = null
    }

    if (center && radiusKm && mapRef.current) {
      radiusLayerRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(mapRef.current)
    }

    return () => {
      markersLayerRef.current?.clearLayers()
    }
  }, [hospitals, center, radiusKm, onHospitalClick])

  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersLayerRef.current = null
      radiusLayerRef.current = null
    }
  }, [])

  return <div ref={mapContainer} className="h-full w-full rounded-lg z-0" />
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
