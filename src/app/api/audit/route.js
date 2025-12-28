import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // --- STEP 1: PARSE INPUT ---
  // Input: "20433 Trovinger Mill Road..."
  // We split by spaces or commas to get the raw words
  const parts = addressQuery.toUpperCase().split(/[\s,]+/).filter(Boolean);

  if (parts.length < 2) {
    return NextResponse.json({ error: 'Address too short' }, { status: 400 });
  }

  const houseNumber = parts[0];
  const streetName = parts[1];

  // --- STEP 2: CONSTRUCT SQL ---
  // We want: ADDRESS LIKE '20433 TROVINGER%'
  // 1. We start with the number.
  // 2. We add ONE space.
  // 3. We add the first street name.
  // 4. We add ONE wildcard (%) at the end to catch "RD", "ST", "MILL RD", etc.
  // CRITICAL: We REMOVED the leading wildcard. It is unnecessary and risky.
  const sqlWhere = `ADDRESS LIKE '${houseNumber} ${streetName}%'`;

  // --- STEP 3: BROWSER-STANDARD ENCODING ---
  // instead of manual hex codes, we let JS handle the math.
  // This turns spaces into %20 and % into %25 automatically.
  const encodedWhere = encodeURIComponent(sqlWhere);

  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";

  // We stitch it together. 
  // Note: We use &variable=value format standard for APIs.
  const finalUrl = `${baseUrl}?f=json&returnGeometry=false&outFields=ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE&where=${encodedWhere}`;

  console.log("EXECUTE URL:", finalUrl);

  try {
    const res = await fetch(finalUrl, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`State Server Error: ${res.status}`);
    }

    const json = await res.json();

    if (!json.features || json.features.length === 0) {
      // Debug info in the error so we know what failed
      return NextResponse.json({ error: `Not found. SQL tried: ${sqlWhere}` }, { status: 404 });
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
