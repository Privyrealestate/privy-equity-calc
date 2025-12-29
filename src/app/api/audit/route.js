import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // --- STEP 1: PARSE INPUT ---
  const parts = addressQuery.toUpperCase().split(/[\s,]+/).filter(Boolean);

  if (parts.length < 2) {
    return NextResponse.json({ error: 'Address too short' }, { status: 400 });
  }

  const houseNumber = parts[0];
  const streetName = parts[1];

  // --- STEP 2: CONSTRUCT SQL (THE FIX) ---
  // We are restoring the leading '%' which makes the query match:
  // " 20433 TROVINGER..." (Leading Space)
  // "020433 TROVINGER..." (Zero Padding)
  // The working browser link had this %, so we MUST include it.
  const sqlWhere = `ADDRESS LIKE '%${houseNumber} ${streetName}%'`;

  // --- STEP 3: BROWSER-STANDARD ENCODING ---
  const encodedWhere = encodeURIComponent(sqlWhere);

  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";

  const finalUrl = `${baseUrl}?f=json&returnGeometry=false&outFields=ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE&where=${encodedWhere}`;

  console.log("EXECUTE URL:", finalUrl);

  try {
    const res = await fetch(finalUrl, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`State Server Error: ${res.status}`);
    }

    const json = await res.json();

    if (!json.features || json.features.length === 0) {
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
