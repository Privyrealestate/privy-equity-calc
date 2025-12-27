export async function getPropertyData(lat, lng) {
  try {
    // 1. SETUP: Define the "Box"
    // We create a massive box (~500 meters) to ensure we hit something.
    const offset = 0.005;
    const xmin = lng - offset;
    const ymin = lat - offset;
    const xmax = lng + offset;
    const ymax = lat + offset;

    // 2. CONSTRUCT URL: The "Raw" Request
    // We are bypassing the library and talking directly to the API.
    const baseUrl = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0/query";
    const params = new URLSearchParams({
      f: "json",
      returnGeometry: "false",
      spatialRel: "esriSpatialRelIntersects",
      geometryType: "esriGeometryEnvelope",
      geometry: `${xmin},${ymin},${xmax},${ymax}`, // The manual box
      inSR: "4326", // Input is Lat/Long
      outFields: "ACCTID,ADDRESS,OWNNAME1,NFMTTLVL,ASSDLAND,ASSDIMPR,LZN,MORTGAG1,TRADATE"
    });

    const queryUrl = `${baseUrl}?${params.toString()}`;
    console.log("Investigating URL:", queryUrl); // This helps us debug if needed

    // 3. EXECUTE: Send the investigator
    const response = await fetch(queryUrl);
    const json = await response.json();

    // 4. CHECK: Did we find it?
    if (!json.features || json.features.length === 0) {
      console.warn("Government Server returned zero results.");
      return null;
    }

    // 5. SUCCESS: Format the data
    const data = json.features[0].attributes;
    
    return {
      taxId: data.ACCTID,
      address: data.ADDRESS,
      owner: data.OWNNAME1,
      assessedValue: data.NFMTTLVL,
      zoning: data.LZN,
      lastSaleDate: data.TRADATE,
      lastMortgage: data.MORTGAG1
    };

  } catch (error) {
    console.error("Critical Fetch Error:", error);
    return null;
  }
}
