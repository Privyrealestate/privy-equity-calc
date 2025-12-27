'use client'

import { useState } from 'react'
import AddressSearch from '../components/AddressSearch'
import MapBackground from '../components/MapBackground'

export default function Home() {
  const [coordinates, setCoordinates] = useState([-77.4108, 39.4143]) 
  const [selectedProp, setSelectedProp] = useState(null)

  const handleSelect = (place) => {
    setSelectedProp(place)
    setCoordinates(place.center)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-transparent">
      
      {/* Background Map Layer */}
      <MapBackground coordinates={coordinates} />

      {/* Content Layer (z-10) - Floating on top */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-8">
        
        {/* Brand Header with Glass Effect */}
        <div className="text-center space-y-4 bg-privy-ledger/90 p-10 rounded-2xl shadow-2xl border border-privy-dominion/5 backdrop-blur-xl">
          <h1 className="font-serif text-6xl text-privy-dominion tracking-tight">
            privy
          </h1>
          <p className="text-privy-dominion/60 font-mono text-xs tracking-[0.3em] uppercase">
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
