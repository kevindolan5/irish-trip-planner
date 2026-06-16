// Rough driving estimates via OSRM's free public router (no API key).
import { AREAS, resolveLatLng } from "./areas.js";

// Resolve a free-text place to coordinates: match a stop by name, else a town.
export function labelLatLng(label, stops) {
  const key = String(label || "").trim().toLowerCase();
  if (!key) return null;
  const stop = stops.find((s) => String(s.name || "").trim().toLowerCase() === key);
  if (stop) {
    const ll = resolveLatLng(stop);
    if (ll) return ll;
  }
  return AREAS[key] || null;
}

// a, b are [lat, lng]. Returns { mins, km } or null.
export async function driveEstimate(a, b) {
  const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing failed (${res.status})`);
  const data = await res.json();
  if (!data.routes || !data.routes.length) return null;
  return {
    mins: Math.round(data.routes[0].duration / 60),
    km: Math.round(data.routes[0].distance / 1000),
  };
}

export function formatDuration(mins) {
  if (mins == null || isNaN(mins)) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}
