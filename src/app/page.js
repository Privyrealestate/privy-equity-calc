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
    <main className="relative w-full h-screen overflow-hidden">
      
      {/* Layer 1: The Interactive Map */}
      <MapBackground coordinates={coordinates} />

      {/* Layer 2: The Floating Content */}
      {/* pointer-events-none allows you to click the map "through" the empty spaces */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 pointer-events-none">
        
        {/* Brand Card - pointer-events-auto lets you select text here */}
        <div className="pointer-events-auto text-center space-y-4 bg-privy-ledger/90 p-10 rounded-2xl shadow-2xl border border-privy-dominion/5 backdrop-blur-xl max-w-2xl w-full animate-in fade-in zoom-in duration-700">
          <h1 className="font-serif text-6xl text-privy-dominion tracking-tight">
            privy
          </h1>
          <p className="text-privy-dominion/60 font-mono text-xs tracking-[0.3em] uppercase">
            Hidden Equity Intelligence
          </p>
          
          {/* Search Bar Area */}
          <div className="pt-4 w-full">
             <AddressSearch onAddressSelect={handleSelect} />
          </div>
        </div>

      </div>
    </main>
  )
}
