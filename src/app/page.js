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
    console.log("Selected:", place)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden bg-privy-ledger">
      
      {/* Background Map Layer */}
      <MapBackground coordinates={coordinates} />

      {/* Content Layer */}
      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-5xl md:text-7xl text-privy-dominion">
            privy
          </h1>
          <p className="text-privy-dominion/80 font-mono text-xs tracking-[0.3em] uppercase">
            Hidden Equity Intelligence
          </p>
        </div>

        {/* Search Interface */}
        <div className="w-full max-w-xl shadow-2xl shadow-privy-dominion/10">
          <AddressSearch onAddressSelect={handleSelect} />
        </div>

        {/* Status Message */}
        {!selectedProp && (
          <p className="text-privy-dominion/60 font-sans text-sm max-w-md text-center">
            Enter your address to begin the forensic audit of your property value.
          </p>
        )}
      </div>
    </main>
  )
}
