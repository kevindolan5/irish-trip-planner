// Turn a typed address into coordinates using OpenStreetMap's free Nominatim
// service (no API key). Biased to Ireland + the UK (covers Northern Ireland).
// Usage policy: low volume, one lookup per "Locate" click — fine for this.

export async function geocode(query) {
  const q = String(query || "").trim();
  if (!q) return null;
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=0" +
    "&countrycodes=ie,gb&q=" +
    encodeURIComponent(q);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  if (!data.length) return null;
  const hit = data[0];
  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    label: hit.display_name,
  };
}

// A Google Maps link for an address or coordinates — handy for guests navigating.
export function mapsLink({ address, lat, lng }) {
  if (address && address.trim()) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address.trim());
  }
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return null;
}
