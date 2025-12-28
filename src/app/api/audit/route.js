import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // We now accept 'address' instead of lat/lng
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // CLEAN THE ADDRESS
  // Mapbox gives "20433 Trovinger Mill Road, Hagerstown..."
  // Maryland stores "20433 TROVINGER MILL RD"
  // We grab the first part (Number + Street Name) to be safe.
  const cleanAddress = addressQuery.split(',')[0].toUpperCase(); 

  console.log("Searching Maryland DB for:", cleanAddress);

  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";
  
  // SQL QUERY: Find any record that *starts with* our address string
  const params = new URLSearchParams({
    f: "json",
    where: `ADDRESS LIKE '${cleanAddress}%'`, // The Magic Switch
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
      return NextResponse.json({ error: 'Property not found in State Records.' }, { status: 404 });
    }

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
