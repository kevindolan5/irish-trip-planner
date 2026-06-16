import React, { useState } from "react";
import { STOP_TYPES, ITINERARY_COLORS } from "../config.js";
import { fmt, nights, stayRange, peakOccupancy } from "../lib/dates.js";
import { setAssignment, setAssignmentRange } from "../firebase.js";
import { mapsLink } from "../lib/geocode.js";
import { Btn } from "./common.jsx";
import Icon from "./icons.jsx";

const dateCls = "border border-stone-200 rounded-md px-1.5 py-1 text-[11px] text-stone-600 bg-white";

function StopCard({ stop, guests, onEdit, dragGuestId, setDragGuestId }) {
  const [over, setOver] = useState(false);
  const t = STOP_TYPES[stop.type] || STOP_TYPES.activity;
  const isActivity = stop.type === "activity";
  const assigned = guests.filter((g) => stop.guestIds && stop.guestIds[g.id]);
  const peak = peakOccupancy(stop, guests);
  const unassigned = guests.filter((g) => !stop.guestIds || !stop.guestIds[g.id]);
  const overCap = stop.capacity != null && peak > stop.capacity;

  function drop(e) {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/guest") || dragGuestId;
    if (id && !isActivity) setAssignment(stop.id, id, true);
    setDragGuestId(null);
  }

  return (
    <div
      onDragOver={(e) => { if (!isActivity) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className={`bg-white rounded-2xl border flex flex-col transition-shadow ${
        over ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-stone-200"
      }`}
    >
      <div className="px-4 pt-3.5 pb-3 border-b border-stone-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="mt-0.5 shrink-0" style={{ color: t.color }}><Icon name={t.icon} size={18} /></span>
            <div className="min-w-0">
              <h3 className="font-display text-[1.05rem] text-emerald-950 leading-tight tracking-tight truncate">{stop.name}</h3>
              <div className="text-[11px] font-medium uppercase tracking-[0.05em] mt-0.5" style={{ color: t.color }}>
                {t.short}{stop.area ? ` · ${stop.area}` : ""}
              </div>
            </div>
          </div>
          <button onClick={() => onEdit(stop)} className="text-xs text-stone-400 hover:text-stone-700 shrink-0">Edit</button>
        </div>
        {!isActivity && (
          <div className="text-xs text-stone-500 mt-2 flex items-center gap-2 flex-wrap">
            <span>{fmt(stop.from)} → {fmt(stop.to)} · {nights(stop.from, stop.to)}n</span>
            {stop.capacity != null && (
              <span className={`font-medium px-1.5 py-0.5 rounded-md ${overCap ? "bg-rose-50 text-rose-600" : "bg-stone-100 text-stone-500"}`}>
                {peak}/{stop.capacity} beds{overCap ? " · over" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex-1">
        {stop.address && (
          <p className="text-xs text-stone-600 mb-2 leading-relaxed">
            {stop.address}
            {mapsLink(stop) && (
              <> · <a href={mapsLink(stop)} target="_blank" rel="noopener" className="text-emerald-700 hover:underline font-medium">map</a></>
            )}
          </p>
        )}
        {stop.notes && <p className="text-xs text-stone-500 mb-2.5 leading-relaxed">{stop.notes}</p>}
        {isActivity ? (
          <p className="text-xs text-stone-400 italic">Recommendation — no one's assigned to activities.</p>
        ) : assigned.length === 0 ? (
          <p className="text-xs text-stone-400">Nobody here yet. Drag someone in, or use the menu below.</p>
        ) : (
          <ul className="space-y-1.5">
            {assigned.map((g) => {
              const r = stayRange(stop, g.id);
              return (
                <li key={g.id} className="bg-stone-50 rounded-lg px-2.5 py-2">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm text-stone-700">{g.name}{(Number(g.partySize) || 1) > 1 ? ` · ${g.partySize}` : ""}</span>
                    <button onClick={() => setAssignment(stop.id, g.id, false)} aria-label={`Remove ${g.name}`} className="text-stone-300 hover:text-rose-600 ml-2 shrink-0 p-0.5">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <input
                      type="date"
                      className={dateCls}
                      value={r.fromIso || ""}
                      min={stop.from}
                      max={stop.to}
                      onChange={(e) => setAssignmentRange(stop.id, g.id, e.target.value, r.toIso)}
                    />
                    <span className="text-stone-300 text-xs">→</span>
                    <input
                      type="date"
                      className={dateCls}
                      value={r.toIso || ""}
                      min={stop.from}
                      max={stop.to}
                      onChange={(e) => setAssignmentRange(stop.id, g.id, r.fromIso, e.target.value)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!isActivity && unassigned.length > 0 && (
        <div className="px-4 pb-3.5">
          <select
            value=""
            onChange={(e) => e.target.value && setAssignment(stop.id, e.target.value, true)}
            className="w-full text-xs border border-stone-200 rounded-lg px-2.5 py-2 text-stone-500 bg-white hover:border-stone-300 cursor-pointer"
          >
            <option value="">+ Add someone…</option>
            {unassigned.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

export default function OrganiseBoard({ guests, stops, itinerary, routes, onEditStop, onAddStop, onEditItinerary, onAddItinerary, onEditRoute, onAddRoute, dragGuestId, setDragGuestId }) {
  const beds = stops.filter((s) => s.type !== "activity");
  const activities = stops.filter((s) => s.type === "activity");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-emerald-950 tracking-tight">Organise</h2>
          <p className="text-sm text-stone-500 mt-1 max-w-lg">Add the places you're organising, then drop people in. Each person can have their own dates within a house. Gaps show up as “book your own” on everyone's timeline.</p>
        </div>
        <Btn onClick={onAddStop} className="shrink-0"><Icon name="plus" size={15} /> Add stop</Btn>
      </div>

      {/* Itinerary / the rough plan */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-base text-emerald-950">The plan</h3>
            <p className="text-xs text-stone-500 mt-0.5">The rough itinerary shown along the top of everyone's timeline.</p>
          </div>
          <Btn variant="outline" onClick={onAddItinerary} className="shrink-0 !py-1.5"><Icon name="plus" size={14} /> Add phase</Btn>
        </div>
        {(!itinerary || itinerary.length === 0) ? (
          <p className="text-xs text-stone-400">Nothing yet — e.g. “Around Ennis”, “Wedding weekend”, “Kerry”.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {itinerary.map((p, i) => {
              const c = ITINERARY_COLORS[i % ITINERARY_COLORS.length];
              return (
                <li key={p.id}>
                  <button
                    onClick={() => onEditItinerary(p)}
                    className="flex items-center gap-2 rounded-lg pl-2.5 pr-3 py-1.5 text-xs hover:brightness-95 transition"
                    style={{ background: c.bg, color: c.text }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: c.border }} />
                    <span className="font-medium">{p.label}</span>
                    <span className="opacity-70">{fmt(p.from)}–{fmt(p.to)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Getting around / transport */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-base text-emerald-950">Getting around</h3>
            <p className="text-xs text-stone-500 mt-0.5">Rough travel times between spots, shown under the map. “Estimate” fills the drive time for you.</p>
          </div>
          <Btn variant="outline" onClick={onAddRoute} className="shrink-0 !py-1.5"><Icon name="plus" size={14} /> Add route</Btn>
        </div>
        {(!routes || routes.length === 0) ? (
          <p className="text-xs text-stone-400">Nothing yet — e.g. “Dublin → Ennis”, “Ennis → Kerry”.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {routes.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => onEditRoute(r)}
                  className="flex items-center gap-2 rounded-lg pl-3 pr-3 py-1.5 text-xs bg-stone-50 text-stone-700 hover:bg-stone-100 transition"
                >
                  <span className="font-medium">{r.from} → {r.to}</span>
                  {r.duration && <span className="text-emerald-700 font-medium">{r.duration}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {stops.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl px-4 py-12 text-center text-stone-400 text-sm">
          No stops yet. Add the first place you've got sorted — a family house, a block-booked hotel, an Airbnb.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beds.map((s) => (
            <StopCard key={s.id} stop={s} guests={guests} onEdit={onEditStop} dragGuestId={dragGuestId} setDragGuestId={setDragGuestId} />
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div>
          <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.08em] mb-3">Things to do</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((s) => (
              <StopCard key={s.id} stop={s} guests={guests} onEdit={onEditStop} dragGuestId={dragGuestId} setDragGuestId={setDragGuestId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
