'use client'

import { useState } from 'react'
import AddressSearch from '../components/AddressSearch'
import MapBackground from '../components/MapBackground'
import { getPropertyData } from '../utils/fetchData' // IMPORT THE INVESTIGATOR

export default function Home() {
  const [coordinates, setCoordinates] = useState([-77.4108, 39.4143]) 
  const [selectedProp, setSelectedProp] = useState(null)
  const [propertyData, setPropertyData] = useState(null) // NEW: Store the tax data
  const [loading, setLoading] = useState(false) // NEW: Show a spinner

  const handleSelect = async (place) => {
    setSelectedProp(place)
    setCoordinates(place.center)
    
    // START THE INVESTIGATION
    setLoading(true)
    // Mapbox returns [lng, lat], but our function needs (lat, lng)
    const data = await getPropertyData(place.center[1], place.center[0]) 
    setPropertyData(data)
    setLoading(false)
  }

  return (
    <main className="relative w-full h-screen overflow-hidden">
      
      {/* Layer 1: The Interactive Map */}
      <MapBackground coordinates={coordinates} />

      {/* Layer 2: The Floating Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 pointer-events-none">
        
        {/* Brand Card */}
        <div className="pointer-events-auto text-center space-y-4 bg-privy-ledger/90 p-10 rounded-2xl shadow-2xl border border-privy-dominion/5 backdrop-blur-xl max-w-2xl w-full animate-in fade-in zoom-in duration-700">
          
          {/* UPDATED LOGO: Libre Franklin + Spaced Out */}
          <h1 className="font-sans text-5xl md:text-7xl font-bold text-privy-dominion tracking-[0.2em] uppercase">
            privy
          </h1>
          <p className="text-privy-dominion/60 font-mono text-xs tracking-[0.3em] uppercase">
            Hidden Equity Intelligence
          </p>
          
          {/* Search Bar Area */}
          <div className="pt-4 w-full">
             <AddressSearch onAddressSelect={handleSelect} />
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="pt-4 text-privy-vigilance font-mono text-sm animate-pulse">
              ACCESSING STATE RECORDS...
            </div>
          )}

          {/* RESULTS DISPLAY (The "Proof of Life") */}
          {propertyData && !loading && (
            <div className="mt-6 p-4 bg-privy-dominion/5 rounded-lg border border-privy-dominion/10 text-left space-y-2">
              <div className="flex justify-between border-b border-privy-dominion/10 pb-2">
                <span className="font-serif text-privy-dominion">Tax Assessment:</span>
                <span className="font-mono font-bold text-privy-dominion">
                  ${parseInt(propertyData.assessedValue).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-privy-dominion/10 pb-2">
                <span className="font-serif text-privy-dominion">Zoning Code:</span>
                <span className="font-mono text-privy-copper">{propertyData.zoning}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-serif text-privy-dominion">Owner (Hidden):</span>
                <span className="font-mono text-privy-dominion/50">PRIVACY PROTECTED</span>
              </div>
            </div>
          )}
          
          {/* ERROR STATE (If we miss the house) */}
          {!propertyData && selectedProp && !loading && (
            <div className="mt-4 text-red-500 font-mono text-xs">
              ⚠️ PARCEL DATA NOT FOUND (Try a verified address)
            </div>
          )}

        </div>

      </div>
    </main>
  )
}
