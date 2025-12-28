import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // --- THE CLEANING PROCESS ---
  // 1. Get the first part (e.g., "20433 Trovinger Mill Road") and uppercase it
  let cleanAddress = addressQuery.split(',')[0].toUpperCase();

  // 2. Remove the "Suffix Killers"
  // We delete "ROAD", "STREET", etc. so "RD" vs "ROAD" doesn't matter.
  const suffixes = ["ROAD", "STREET", "AVENUE", "DRIVE", "LANE", "COURT", "CIRCLE", "PIKE", "BOULEVARD", "WAY"];
  suffixes.forEach(suffix => {
    // Replace full word with empty string (e.g. " ROAD" -> "")
    cleanAddress = cleanAddress.replace(new RegExp(`\\b${suffix}\\b`, 'g'), '');
  });

  // 3. Trim extra whitespace
  cleanAddress = cleanAddress.trim();

  // 4. Inject Wildcards
  // "20433 TROVINGER MILL" becomes "20433%TROVINGER%MILL%"
  // This tells SQL: "Match these words in this order, regardless of spacing or abbreviation"
  const fuzzyQuery = cleanAddress.replace(/\s+/g, '%') + '%';

  console.log("Searching Maryland DB for:", fuzzyQuery);

  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";
  
  const params = new URLSearchParams({
    f: "json",
    where: `ADDRESS LIKE '${fuzzyQuery}'`, // <--- The Fuzzy Search
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
