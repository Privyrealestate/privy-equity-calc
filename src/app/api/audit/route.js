import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // --- THE "VERIFIED LINK" STRATEGY ---
  // We are replicating the manual test that worked:
  // query?where=ADDRESS+LIKE+'%20433 TROVINGER%'

  // 1. Clean the input
  // Input: "20433 Trovinger Mill Road, Hagerstown..."
  const cleanString = addressQuery.toUpperCase().replace(/,/g, ' '); 
  
  // 2. Extract Parts
  // ["20433", "TROVINGER", "MILL", "ROAD"...]
  const parts = cleanString.split(' ').filter(part => part.trim().length > 0);

  // 3. Build the "Golden Key"
  // We want EXACTLY: "20433 TROVINGER"
  const houseNumber = parts[0];
  const streetName = parts[1];

  if (!houseNumber || !streetName) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  // 4. Construct the SQL
  // The % at the start handles prefixes.
  // The % at the end handles suffixes (Mill Rd, St, etc).
  // CRITICAL: Only ONE space between number and name, just like the working link.
  const sqlQuery = `%${houseNumber} ${streetName}%`;

  console.log("Searching Maryland DB for:", sqlQuery);

  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";
  
  const params = new URLSearchParams({
    f: "json",
    where: `ADDRESS LIKE '${sqlQuery}'`, // <--- The Exact Syntax that worked
    outFields: "ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE",
    returnGeometry: "false"
  });

  try {
    const res = await fetch(`${baseUrl}?${params.toString()}`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`State Server Error: ${res.status}`);
    }

    const json = await res.json();

    // ERROR CHECKING
    if (!json.features || json.features.length === 0) {
      console.log("Zero results for:", sqlQuery);
      return NextResponse.json({ error: 'Property not found in State Records.' }, { status: 404 });
    }

    // SUCCESS
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
