import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { STOP_TYPES } from "../config.js";
import { resolveLatLng } from "../lib/areas.js";
import { fmt, stayRange } from "../lib/dates.js";
import { mapsLink } from "../lib/geocode.js";
import { pinSvg } from "./icons.jsx";

function pinIcon(type) {
  const t = STOP_TYPES[type] || STOP_TYPES.activity;
  return L.divIcon({
    className: "trip-pin",
    html: pinSvg(t.color),
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

export default function MapView({ stops, guests, routes = [] }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: true }).setView([53.3, -7.9], 7);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 50);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const guestName = Object.fromEntries(guests.map((g) => [g.id, g.name]));
    const bounds = [];

    stops.forEach((s) => {
      const ll = resolveLatLng(s);
      if (!ll) return;
      bounds.push(ll);
      const t = STOP_TYPES[s.type] || STOP_TYPES.activity;
      let html = `<div style="font-family:inherit;min-width:140px"><div style="font-size:.7rem;font-weight:600;color:${t.color};text-transform:uppercase;letter-spacing:.05em">${t.label}</div>`;
      html += `<h4 style="margin:1px 0 0;font-size:.98rem;font-weight:600;color:#064e3b">${s.name}</h4>`;
      if (s.from && s.to) html += `<div style="font-size:.8rem;color:#78716c;margin-top:3px">${fmt(s.from)} – ${fmt(s.to)}</div>`;
      if (s.address) html += `<p style="margin:7px 0 0;font-size:.8rem;color:#44403c;line-height:1.4">${s.address}</p>`;
      if (s.notes) html += `<p style="margin:6px 0 0;font-size:.8rem;color:#78716c;line-height:1.4">${s.notes}</p>`;
      const occ = Object.keys(s.guestIds || {})
        .map((id) => {
          const nm = guestName[id];
          if (!nm) return null;
          const r = stayRange(s, id);
          return r.fromIso && r.toIso ? `${nm} (${fmt(r.fromIso)}–${fmt(r.toIso)})` : nm;
        })
        .filter(Boolean);
      if (occ.length) html += `<div style="margin-top:7px;font-size:.78rem;color:#44403c"><span style="color:#a8a29e">Staying here</span><br>${occ.join("<br>")}</div>`;
      const directions = mapsLink(s);
      html += `<div style="margin-top:8px;display:flex;gap:12px">`;
      if (directions) html += `<a href="${directions}" target="_blank" rel="noopener" style="color:#047857;font-weight:600;font-size:.8rem;text-decoration:none">Directions →</a>`;
      if (s.link) html += `<a href="${s.link}" target="_blank" rel="noopener" style="color:#047857;font-weight:600;font-size:.8rem;text-decoration:none">Link →</a>`;
      html += `</div>`;
      html += `</div>`;
      L.marker(ll, { icon: pinIcon(s.type) }).bindPopup(html).addTo(layer);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 });
  }, [stops, guests]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-2xl text-emerald-950 tracking-tight">The map</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500">
          {Object.values(STOP_TYPES).map((t) => (
            <span key={t.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <div ref={ref} className="h-[460px] sm:h-[580px] rounded-2xl border border-stone-200 overflow-hidden" style={{ zIndex: 0 }} />

      {routes.length > 0 && (
        <div className="mt-7">
          <h2 className="font-display text-2xl text-emerald-950 tracking-tight mb-1">Getting around</h2>
          <p className="text-sm text-stone-500 mb-4">Rough travel times between the main spots — Ireland's smaller than it looks, but the roads are slower.</p>
          <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
            {routes.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-800 truncate">
                    {r.from} <span className="text-stone-300">→</span> {r.to}
                  </div>
                  {r.note && <div className="text-xs text-stone-500 mt-0.5 truncate">{r.note}</div>}
                </div>
                <div className="text-right shrink-0">
                  {r.duration && <div className="text-sm font-semibold text-emerald-800">{r.duration}</div>}
                  {r.km != null && <div className="text-xs text-stone-400">{r.km} km</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
