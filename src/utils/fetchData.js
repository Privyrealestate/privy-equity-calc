import { queryFeatures } from '@esri/arcgis-rest-feature-layer';

// The Official MD iMap Parcel Layer (Tax Data)
const MD_PARCEL_LAYER = "https://geodata.md.gov/imap/rest/services/PlanningCadastre/MD_PropertyData/MapServer/0";

export async function getPropertyData(lat, lng) {
  try {
    // 1. Ask Maryland: "What parcel is NEAR these coordinates?"
    const response = await queryFeatures({
      url: MD_PARCEL_LAYER,
      geometry: { x: lng, y: lat },
      geometryType: "esriGeometryPoint",
      spatialRel: "esriSpatialRelIntersects",
      inSR: "4326", // Lat/Long format
      distance: 25, // <--- THE FIX: Look within 25 meters (approx 80ft) of the point
      units: "esriSRUnit_Meter",
      outFields: ["ACCTID", "ADDRESS", "OWNNAME1", "NFMTTLVL", "ASSDLAND", "ASSDIMPR", "LZN", "MORTGAG1", "TRADATE"],
      returnGeometry: false,
      f: "json"
    });

    // 2. Did we find anything?
    if (!response.features || response.features.length === 0) {
      console.warn("No parcel found at location.");
      return null;
    }

    // 3. Clean up the messy government data
    const data = response.features[0].attributes;
    
    return {
      taxId: data.ACCTID,
      address: data.ADDRESS,
      owner: data.OWNNAME1, 
      assessedValue: data.NFMTTLVL, // Total Assessed Value
      zoning: data.LZN, // Local Zoning Code
      lastSaleDate: data.TRADATE,
      lastMortgage: data.MORTGAG1 // The "Hidden" Debt variable
    };

  } catch (error) {
    console.error("Maryland Data Fetch Error:", error);
    return null;
  }
}
