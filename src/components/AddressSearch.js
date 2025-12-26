'use client'

import { useState } from 'react'

export default function AddressSearch({ onAddressSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    const value = e.target.value
    setQuery(value)

    if (value.length > 3) {
      setLoading(true)
      try {
        // Restrict search to Maryland (bbox) to ensure local results
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&bbox=-79.4877,37.8864,-75.0489,39.723&types=address`
        )
        const data = await response.json()
        setResults(data.features || [])
      } catch (error) {
        console.error("Search failed:", error)
      }
      setLoading(false)
    } else {
      setResults([])
    }
  }

  return (
    <div className="w-full max-w-xl relative z-50">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Enter your property address..."
          className="w-full bg-privy-ledger/90 border border-privy-dominion/20 p-4 text-lg text-privy-dominion placeholder:text-privy-dominion/40 focus:outline-none focus:ring-2 focus:ring-privy-copper font-serif rounded-none backdrop-blur-sm"
        />
        {loading && (
          <div className="absolute right-4 top-4 text-privy-dominion/50 text-sm animate-pulse">
            Locating...
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute w-full bg-white/95 border border-privy-dominion/10 mt-1 shadow-2xl max-h-60 overflow-y-auto backdrop-blur-md">
          {results.map((place) => (
            <button
              key={place.id}
              onClick={() => {
                setQuery(place.place_name)
                setResults([])
                onAddressSelect(place)
              }}
              className="w-full text-left p-3 hover:bg-privy-copper/10 border-b border-gray-100 text-privy-dominion font-sans text-sm transition-colors"
            >
              {place.place_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
