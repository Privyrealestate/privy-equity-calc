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
      // Fly to new location if map exists
      map.current.flyTo({
        center: coordinates,
        zoom: 16,
        pitch: 60, // 3D Tilt effect
        bearing: 0,
        essential: true
      })
      return
    }

    // Initialize Map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9', // Satellite View
      center: coordinates,
      zoom: 16,
      pitch: 60,
      interactive: false, // Keep it static/background only for vibe
      attributionControl: false
    })

  }, [coordinates])

  return (
    <div 
      ref={mapContainer} 
      className="fixed inset-0 w-full h-full opacity-40 mix-blend-multiply transition-opacity duration-1000"
    />
  )
}
