// Pinning a stop on the map, the keyless way.
//
// OpenStreetMap's Nominatim has NO Eircode data and patchy Irish house-number
// coverage, so we do two things:
//   1. parseCoords() — accept a pasted Google Maps link or "lat, lng" for an
//      exact pin (Google Maps understands Eircodes; we just read the numbers).
//   2. geocode() — progressive fallback: try the full address, then the street,
//      then the town, so a typed address still lands somewhere sensible.

const IE_EIRCODE = /\b[ac-fh-np-tv-z]\d{2}\s?[0-9ac-fh-np-tv-z]{4}\b/gi;

// Pull coordinates out of pasted text: raw "lat, lng" or a Google Maps URL.
export function parseCoords(input) {
  const s = String(input || "").trim();
  if (!s) return null;

  // plain "53.27, -9.05" (or space-separated)
  let m = s.match(/^(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (m) return coords(m[1], m[2]);

  // ...maps/@53.27,-9.05,15z
  m = s.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (m) return coords(m[1], m[2]);

  // ...!3d53.27!4d-9.05  (place pin in a Maps URL)
  m = s.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/);
  if (m) return coords(m[1], m[2]);

  // ?q=53.27,-9.05 / ?query= / ?ll= / ?destination=
  m = s.match(/[?&](?:q|query|ll|destination|center)=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (m) return coords(m[1], m[2]);

  return null;
}

function coords(a, b) {
  const lat = Number(a), lng = Number(b);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

// Build search variants from most to least specific, dropping the Eircode
// (Nominatim chokes on it) and peeling off leading address parts.
function variants(query) {
  const cleaned = String(query || "").replace(IE_EIRCODE, "").replace(/,\s*,/g, ",").replace(/^[,\s]+|[,\s]+$/g, "").trim();
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const v = parts.slice(i).join(", ");
    if (v && !out.includes(v)) out.push(v);
  }
  return out.length ? out : [cleaned].filter(Boolean);
}

async function nominatim(q) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=0&countrycodes=ie,gb&q=" +
    encodeURIComponent(q);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  if (!data.length) return null;
  return { lat: Number(data[0].lat), lng: Number(data[0].lon), label: data[0].display_name };
}

// Returns { lat, lng, label, approx } or null. `approx` = matched a broader
// fallback (street/town) rather than the exact thing typed.
export async function geocode(query) {
  // a pasted link / coordinates wins — and is exact
  const direct = parseCoords(query);
  if (direct) return { ...direct, label: "Pinned from coordinates", approx: false };

  const tries = variants(query);
  for (let i = 0; i < tries.length; i++) {
    try {
      const hit = await nominatim(tries[i]);
      if (hit) return { ...hit, approx: i > 0 };
    } catch {
      /* try next variant */
    }
  }
  return null;
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
