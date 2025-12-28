import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  // 1. SETUP: Create the "Search Box" (Envelope)
  // 0.002 degrees is roughly 200 meters. A good wide net.
  const offset = 0.002;
  const xmin = parseFloat(lng) - offset;
  const ymin = parseFloat(lat) - offset;
  const xmax = parseFloat(lng) + offset;
  const ymax = parseFloat(lat) + offset;

  // 2. RAW FETCH: Talk to Maryland Server
  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";
  const params = new URLSearchParams({
    f: "json",
    returnGeometry: "false",
    spatialRel: "esriSpatialRelIntersects",
    geometryType: "esriGeometryEnvelope",
    geometry: `${xmin},${ymin},${xmax},${ymax}`,
    inSR: "4326",
    outFields: "ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE"
  });

  try {
    const res = await fetch(`${baseUrl}?${params.toString()}`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`State Server Error: ${res.status}`);
    }

    const json = await res.json();

    // 3. CHECK RESULTS
    if (!json.features || json.features.length === 0) {
      return NextResponse.json({ error: 'No properties found in this location.' }, { status: 404 });
    }

    // 4. RETURN SUCCESS
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
