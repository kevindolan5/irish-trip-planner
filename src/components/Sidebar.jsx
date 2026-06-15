import React from "react";
import { COVERAGE } from "../config.js";
import { guestCoverage, fmt, nights } from "../lib/dates.js";
import { Btn } from "./common.jsx";

function statusDot(summary) {
  if (summary.total === 0) return "#d6d3d1";
  if (summary.gap > 0) return COVERAGE.gap.color;
  if (summary["book-your-own"] > 0) return COVERAGE["book-your-own"].color;
  return COVERAGE.covered.color;
}

export default function Sidebar({ guests, stops, isAdmin, onAddGuest, onPickGuest, setDragGuestId }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
        <h2 className="font-display font-semibold text-emerald-900">Travellers <span className="text-stone-400 font-normal text-sm">({guests.length})</span></h2>
        <Btn onClick={() => onAddGuest(null)} className="!px-2.5 !py-1.5 text-xs">+ Add</Btn>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {guests.length === 0 && (
          <p className="text-sm text-stone-400 px-2 py-6 text-center">Add yourself and your travel dates to get going.</p>
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
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-stone-100 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: statusDot(summary) }} title="Coverage" />
                <span className="text-sm font-semibold text-stone-700 truncate flex-1">{g.name}</span>
                {isAdmin && <span className="text-stone-300 group-hover:text-stone-400 text-xs">⠿</span>}
              </div>
              <div className="text-[11px] text-stone-400 pl-4.5 ml-0.5">
                {fmt(g.arrive)} – {fmt(g.depart)} · {nights(g.arrive, g.depart)}n
                {summary.gap > 0 && <span className="text-rose-500 font-semibold"> · {summary.gap}n to sort</span>}
              </div>
            </button>
          );
        })}
      </div>

      {isAdmin && guests.length > 0 && (
        <div className="px-4 py-2 border-t border-stone-100 text-[11px] text-stone-400">
          Drag a name onto a stop in the Organise tab to assign them.
        </div>
      )}
    </div>
  );
}
