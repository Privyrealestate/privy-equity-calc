'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function MapBackground({ coordinates }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!coordinates) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (map.current) {
      map.current.flyTo({ center: coordinates, zoom: 16 })
      return
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: coordinates,
      zoom: 16,
      attributionControl: false
    })

  }, [coordinates])

  return (
    <div 
      ref={mapContainer} 
      className="fixed inset-0 w-full h-full border-4 border-red-500 z-0"
      style={{ minHeight: '100vh', background: 'gray' }}
    />
  )
}
