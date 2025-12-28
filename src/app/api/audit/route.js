import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const addressQuery = searchParams.get('address'); 

  if (!addressQuery) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }

  // --- STEP 1: PRECISE PARSING ---
  // Use Regex to split by ANY non-word character (spaces, commas, tabs)
  // This handles "20433, Trovinger" or "20433  Trovinger" perfectly.
  const parts = addressQuery.toUpperCase().split(/[\s,]+/).filter(Boolean);

  if (parts.length < 2) {
    return NextResponse.json({ error: 'Address too short' }, { status: 400 });
  }

  // We want EXACTLY: "20433 TROVINGER" (Number + First Name only)
  const houseNumber = parts[0];
  const streetName = parts[1];

  // --- STEP 2: MANUAL URL CONSTRUCTION ---
  // We build the SQL string exactly as it appeared in your successful browser test.
  // We manually encode spaces as %20 and quotes as '
  const sqlLike = `'%${houseNumber} ${streetName}%'`; // Result: '%20433 TROVINGER%'
  
  // Base URL
  const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";

  // We manually stitch the URL string to prevent "Double Encoding" issues
  const finalUrl = `${baseUrl}?f=json&returnGeometry=false&outFields=ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE&where=ADDRESS%20LIKE%20${sqlLike}`;

  console.log("EXECUTE MANUAL URL:", finalUrl);

  try {
    const res = await fetch(finalUrl, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`State Server Error: ${res.status}`);
    }

    const json = await res.json();

    // ERROR CHECKING
    if (!json.features || json.features.length === 0) {
      // DEBUG: We send the failed query back to you so we can see it
      return NextResponse.json({ error: `Not found. Searched for: ${houseNumber} ${streetName}` }, { status: 404 });
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
