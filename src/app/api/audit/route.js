import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // --- THE SIMPLIFIED MATCHING LOGIC ---
  // 1. Clean the input (Upper case, remove commas)
  // Input: "20433 Trovinger Mill Road, Hagerstown, MD..."
  const cleanString = addressQuery.toUpperCase().replace(/,/g, '');
  
  // 2. Split into words
  // ["20433", "TROVINGER", "MILL", "ROAD", "HAGERSTOWN"...]
  const parts = cleanString.split(' ').filter(part => part.trim().length > 0);

  // 3. The "Two-Key" System
  // We only take the first two parts: The Number and the First Name.
  // This avoids issues with "Road" vs "Rd" or "Mill" vs "Mills".
  const houseNumber = parts[0];
  const streetName = parts[1];

  // Safety Check: ensure we actually have two parts
  if (!houseNumber || !streetName) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  // 4. Construct the "Loose" Query
  // Search for: "%20433%TROVINGER%"
  // The leading % handles any weird prefixes.
  // The middle % handles any spaces or missing words.
  const fuzzyQuery = `%${houseNumber}%${streetName}%`;

  console.log("Searching Maryland DB for:", fuzzyQuery);

  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";
  
  const params = new URLSearchParams({
    f: "json",
    where: `ADDRESS LIKE '${fuzzyQuery}'`, // <--- The Broadest Possible Search
    outFields: "ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE",
    returnGeometry: "false"
  });

  try {
    const res = await fetch(`${baseUrl}?${params.toString()}`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`State Server Error: ${res.status}`);
    }

    const json = await res.json();

    if (!json.features || json.features.length === 0) {
      console.log("Zero results found for:", fuzzyQuery);
      return NextResponse.json({ error: 'Property not found in State Records.' }, { status: 404 });
    }

    // SUCCESS: We found it!
    const data = json.features[0].attributes;
    return NextResponse.json({
      taxId: data.ACCTID,
      address: data.ADDRESS,
      owner: data.OWNNAME1,
      assessedValue: data.NFMTTLVL,
      zoning: data.LZN,
      lastSaleDate: data.TRADATE,
      lastMortgage: data.MORTGAG1
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
