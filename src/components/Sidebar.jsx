import React from "react";
import { COVERAGE } from "../config.js";
import { guestCoverage, fmt, nights } from "../lib/dates.js";
import Icon from "./icons.jsx";

function statusColor(summary) {
  if (summary.total === 0) return "#d6d3d1";
  if (summary.gap > 0) return COVERAGE.gap.color;
  if (summary["book-your-own"] > 0) return COVERAGE["book-your-own"].color;
  return COVERAGE.covered.color;
}

export default function Sidebar({ guests, stops, isAdmin, onAddGuest, onPickGuest, setDragGuestId }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3.5 flex items-center justify-between">
        <h2 className="text-[11px] font-semibold text-stone-500 uppercase tracking-[0.08em]">
          Travellers <span className="text-stone-400">· {guests.length}</span>
        </h2>
        <button
          onClick={() => onAddGuest(null)}
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg px-2 py-1 -mr-1"
        >
          <Icon name="plus" size={14} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {guests.length === 0 && (
          <p className="text-sm text-stone-500 px-3 py-8 text-center leading-relaxed">Add yourself and your travel dates to get going.</p>
        )}
        {guests.map((g) => {
          const { summary } = guestCoverage(g, stops);
          return (
            <button
              key={g.id}
              draggable={isAdmin}
              onDragStart={(e) => { e.dataTransfer.setData("text/guest", g.id); setDragGuestId(g.id); }}
              onDragEnd={() => setDragGuestId(null)}
              onClick={() => onPickGuest(g)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: statusColor(summary) }} title="Coverage" />
                <span className="text-sm font-medium text-stone-800 truncate flex-1">{g.name}</span>
                {isAdmin && <span className="text-stone-300 group-hover:text-stone-400"><Icon name="grip" size={14} /></span>}
              </div>
              <div className="text-xs text-stone-500 pl-[18px] mt-0.5">
                {fmt(g.arrive)} – {fmt(g.depart)} · {nights(g.arrive, g.depart)}n
                {summary.gap > 0 && <span className="text-rose-500 font-medium"> · {summary.gap}n to sort</span>}
              </div>
            </button>
          );
        })}
      </div>

      {isAdmin && guests.length > 0 && (
        <div className="px-4 py-3 border-t border-stone-100 text-xs text-stone-400 leading-snug">
          Drag a name onto a stop in the Organise tab to assign them.
        </div>
      )}
    </div>
  );
}
