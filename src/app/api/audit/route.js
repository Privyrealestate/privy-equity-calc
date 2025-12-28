import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // --- STEP 1: PARSE INPUT ---
  // Input: "20433 Trovinger Mill Road..."
  const parts = addressQuery.toUpperCase().split(/[\s,]+/).filter(Boolean);

  if (parts.length < 2) {
    return NextResponse.json({ error: 'Address too short' }, { status: 400 });
  }

  const houseNumber = parts[0];
  const streetName = parts[1];

  // --- STEP 2: HEX ENCODING (THE FIX) ---
  // We cannot use literal spaces ' ' or literal percents '%' because fetch() gets confused.
  // We must use "Hex Speak":
  // %25 = The symbol "%"
  // %20 = The symbol " " (Space)
  // %27 = The symbol "'" (Single Quote)
  
  // We want to build:  '%20433 TROVINGER%'
  // Hex Encoded:      %27%2520433%20TROVINGER%25%27
  
  const sqlValue = `%27%25${houseNumber}%20${streetName}%25%27`;

  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";

  // We stitch the URL manually using the Hex Codes
  const finalUrl = `${baseUrl}?f=json&returnGeometry=false&outFields=ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE&where=ADDRESS%20LIKE%20${sqlValue}`;

  console.log("EXECUTE HEX URL:", finalUrl);

  try {
    const res = await fetch(finalUrl, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`State Server Error: ${res.status}`);
    }

    const json = await res.json();

    if (!json.features || json.features.length === 0) {
      return NextResponse.json({ error: `Not found. Searched for: ${houseNumber} ${streetName}` }, { status: 404 });
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
