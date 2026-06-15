import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { STOP_TYPES } from "../config.js";
import { resolveLatLng } from "../lib/areas.js";
import { fmt } from "../lib/dates.js";

function pinIcon(type) {
  const t = STOP_TYPES[type] || STOP_TYPES.activity;
  return L.divIcon({
    className: "",
    html: `<div class="trip-pin" style="background:${t.color}"><span>${t.icon}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 26],
    popupAnchor: [0, -24],
  });
}

export default function MapView({ stops, guests }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([53.3, -7.9], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
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
      let html = `<div style="font-family:inherit"><h4 style="margin:0 0 2px;font-size:.95rem;font-weight:700;color:#065f46">${t.icon} ${s.name}</h4>`;
      html += `<div style="font-size:.72rem;font-weight:600;color:${t.color};text-transform:uppercase;letter-spacing:.04em">${t.label}</div>`;
      if (s.from && s.to) html += `<div style="font-size:.8rem;color:#57534e;margin-top:3px">${fmt(s.from)} – ${fmt(s.to)}</div>`;
      if (s.notes) html += `<p style="margin:6px 0 0;font-size:.8rem;color:#44403c">${s.notes}</p>`;
      const occ = Object.keys(s.guestIds || {}).map((id) => guestName[id]).filter(Boolean);
      if (occ.length) html += `<div style="margin-top:6px;font-size:.78rem;color:#44403c"><b>Staying here:</b> ${occ.join(", ")}</div>`;
      if (s.link) html += `<p style="margin:6px 0 0"><a href="${s.link}" target="_blank" rel="noopener" style="color:#047857;font-weight:600">Open link →</a></p>`;
      html += `</div>`;
      L.marker(ll, { icon: pinIcon(s.type) }).bindPopup(html).addTo(layer);
    });

    if (bounds.length) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 9 });
  }, [stops, guests]);

  return (
    <div>
      <div ref={ref} className="h-[460px] sm:h-[560px] rounded-xl border border-stone-200 shadow-sm overflow-hidden" style={{ zIndex: 0 }} />
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-stone-500">
        {Object.values(STOP_TYPES).map((t) => (
          <span key={t.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: t.color }} />
            {t.icon} {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
