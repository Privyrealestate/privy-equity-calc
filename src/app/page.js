'use client'

import { useState } from 'react'
import AddressSearch from '../components/AddressSearch'
import MapBackground from '../components/MapBackground'

export default function Home() {
  const [coordinates, setCoordinates] = useState([-77.4108, 39.4143]) 
  const [selectedProp, setSelectedProp] = useState(null)
  const [propertyData, setPropertyData] = useState(null) 
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null) 

  const handleSelect = async (place) => {
    setSelectedProp(place)
    setCoordinates(place.center)
    setLoading(true)
    setPropertyData(null)
    setErrorMsg(null)

    try {
      // THE FIX: We send the ADDRESS TEXT (place.place_name), not the coordinates.
      const res = await fetch(`/api/audit?address=${encodeURIComponent(place.place_name)}`);
      const data = await res.json();

      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setPropertyData(data);
      }
    } catch (err) {
      setErrorMsg("System Error: Could not connect to API.");
    }

    setLoading(false)
  }

  return (
    <main className="relative w-full h-screen overflow-hidden">
      
      <MapBackground coordinates={coordinates} />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 pointer-events-none">
        
        <div className="pointer-events-auto text-center space-y-4 bg-privy-ledger/90 p-10 rounded-2xl shadow-2xl border border-privy-dominion/5 backdrop-blur-xl max-w-2xl w-full animate-in fade-in zoom-in duration-700">
          
          <h1 className="font-sans text-5xl md:text-7xl font-bold text-privy-dominion tracking-[0.2em] uppercase">
            privy
          </h1>
          <p className="text-privy-dominion/60 font-mono text-xs tracking-[0.3em] uppercase">
            Hidden Equity Intelligence
          </p>
          
          <div className="pt-4 w-full">
             <AddressSearch onAddressSelect={handleSelect} />
          </div>

          {loading && (
            <div className="pt-4 text-privy-vigilance font-mono text-sm animate-pulse">
              SEARCHING STATE RECORDS BY ADDRESS...
            </div>
          )}

          {propertyData && !loading && (
            <div className="mt-6 p-4 bg-privy-dominion/5 rounded-lg border border-privy-dominion/10 text-left space-y-2 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between border-b border-privy-dominion/10 pb-2">
                <span className="font-serif text-privy-dominion text-lg">Tax Assessment:</span>
                <span className="font-mono font-bold text-privy-dominion text-lg">
                  ${parseInt(propertyData.assessedValue).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-privy-dominion/10 pb-2">
                <span className="font-serif text-privy-dominion">Zoning Code:</span>
                <span className="font-mono text-privy-copper">{propertyData.zoning}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-serif text-privy-dominion">Owner Record:</span>
                <span className="font-mono text-privy-dominion/50 uppercase text-xs pt-1">
                  {propertyData.owner}
                </span>
              </div>
            </div>
          )}
          
          {errorMsg && !loading && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-red-600 font-mono text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
