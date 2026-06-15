import React, { useState } from "react";
import { STOP_TYPES } from "../config.js";
import { fmt, nights } from "../lib/dates.js";
import { setAssignment } from "../firebase.js";
import { Btn } from "./common.jsx";

function StopCard({ stop, guests, onEdit, dragGuestId, setDragGuestId }) {
  const [over, setOver] = useState(false);
  const t = STOP_TYPES[stop.type] || STOP_TYPES.activity;
  const isActivity = stop.type === "activity";
  const assigned = guests.filter((g) => stop.guestIds && stop.guestIds[g.id]);
  const headcount = assigned.reduce((n, g) => n + (Number(g.partySize) || 1), 0);
  const unassigned = guests.filter((g) => !stop.guestIds || !stop.guestIds[g.id]);
  const over_cap = stop.capacity != null && headcount > stop.capacity;

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
      className={`bg-white rounded-xl border shadow-sm flex flex-col ${over ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-stone-200"}`}
    >
      <div className="px-4 py-3 border-b border-stone-100 rounded-t-xl" style={{ background: t.color + "14" }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span>{t.icon}</span>
              <h3 className="font-display font-semibold text-emerald-900 leading-tight">{stop.name}</h3>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: t.color }}>
              {t.label}{stop.area ? ` · ${stop.area}` : ""}
            </div>
          </div>
          <button onClick={() => onEdit(stop)} className="text-xs text-stone-400 hover:text-stone-700 shrink-0">Edit</button>
        </div>
        {!isActivity && (
          <div className="text-xs text-stone-500 mt-1.5">
            {fmt(stop.from)} → {fmt(stop.to)} · {nights(stop.from, stop.to)} nights
            {stop.capacity != null && (
              <span className={`ml-2 font-semibold ${over_cap ? "text-rose-600" : "text-stone-500"}`}>
                {headcount}/{stop.capacity} beds{over_cap ? " ⚠ over" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex-1">
        {stop.notes && <p className="text-xs text-stone-500 mb-2">{stop.notes}</p>}
        {isActivity ? (
          <p className="text-xs text-stone-400 italic">Recommendation — no one's assigned to activities.</p>
        ) : assigned.length === 0 ? (
          <p className="text-xs text-stone-400 italic">Nobody here yet. Drag someone in, or use the menu below.</p>
        ) : (
          <ul className="space-y-1">
            {assigned.map((g) => (
              <li key={g.id} className="flex items-center justify-between text-sm bg-stone-50 rounded-lg px-2.5 py-1.5">
                <span className="truncate">{g.name}{(Number(g.partySize) || 1) > 1 ? ` (${g.partySize})` : ""}</span>
                <button onClick={() => setAssignment(stop.id, g.id, false)} className="text-stone-400 hover:text-rose-600 text-xs ml-2 shrink-0">remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isActivity && unassigned.length > 0 && (
        <div className="px-4 pb-3">
          <select
            value=""
            onChange={(e) => e.target.value && setAssignment(stop.id, e.target.value, true)}
            className="w-full text-xs border border-stone-200 rounded-lg px-2 py-1.5 text-stone-600 bg-white"
          >
            <option value="">+ Add someone…</option>
            {unassigned.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

export default function OrganiseBoard({ guests, stops, onEditStop, onAddStop, dragGuestId, setDragGuestId }) {
  const beds = stops.filter((s) => s.type !== "activity");
  const activities = stops.filter((s) => s.type === "activity");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">Add the places you're organising, then drop people into them. Gaps show up as “book your own” on everyone's timeline.</p>
        <Btn onClick={onAddStop} className="shrink-0 ml-3">+ Add stop</Btn>
      </div>

      {stops.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-xl px-4 py-10 text-center text-stone-400 text-sm">
          No stops yet. Add the first place you've got sorted (a family house, a block-booked hotel, an Airbnb…).
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
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3 mt-2">Things to do</h3>
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
