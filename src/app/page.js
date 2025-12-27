'use client'

import { useState } from 'react'
import AddressSearch from '../components/AddressSearch'
import MapBackground from '../components/MapBackground'

export default function Home() {
  // Default to Frederick, MD coordinates
  const [coordinates, setCoordinates] = useState([-77.4108, 39.4143]) 
  const [selectedProp, setSelectedProp] = useState(null)

  const handleSelect = (place) => {
    setSelectedProp(place)
    setCoordinates(place.center)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-privy-ledger/20">
      
      {/* Background Map Layer (z-0) */}
      <MapBackground coordinates={coordinates} />

      {/* Content Layer (z-50) - Floating on top */}
      <div className="relative z-50 w-full max-w-5xl flex flex-col items-center gap-8">
        
        {/* Brand Header with Glass Effect */}
        <div className="text-center space-y-4 bg-privy-ledger/80 p-8 rounded-2xl backdrop-blur-md border border-privy-dominion/10 shadow-2xl">
          <h1 className="font-serif text-6xl text-privy-dominion tracking-tight">
            privy
          </h1>
          <p className="text-privy-dominion/80 font-mono text-xs tracking-[0.3em] uppercase">
            Hidden Equity Intelligence
          </p>
        </div>

        {/* Search Interface */}
        <div className="w-full max-w-xl shadow-2xl shadow-black/20">
          <AddressSearch onAddressSelect={handleSelect} />
        </div>

      </div>
    </main>
  )
}
