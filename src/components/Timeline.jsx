import React, { useEffect, useRef, useState } from "react";
import { APP, COVERAGE, ITINERARY_COLORS } from "../config.js";
import { toDay, dayToIso, fmt, guestCoverage, todayIso } from "../lib/dates.js";
import Icon from "./icons.jsx";

const NAME_W = 150;
const MIN_COL = 12;
const MAX_COL = 64;
const STEP = 8;

export default function Timeline({ guests, stops, itinerary = [], onPickGuest }) {
  const scrollRef = useRef(null);
  const [col, setCol] = useState(() => {
    const saved = Number(localStorage.getItem("iwp_zoom"));
    return saved >= MIN_COL && saved <= MAX_COL ? saved : 26;
  });

  const prevCol = useRef(col);

  const start = toDay(APP.rangeStart);
  const end = toDay(APP.rangeEnd);
  const nDays = end - start + 1;
  const wedding = toDay(APP.weddingDate);
  const today = toDay(todayIso());
  const x = (day) => (day - start) * col;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const focus = today >= start && today <= end ? today : wedding;
    el.scrollLeft = Math.max(0, x(focus) - el.clientWidth * 0.4);
  }, [guests.length, stops.length]);

  // persist zoom + keep the view centred where it was as the scale changes
  useEffect(() => {
    localStorage.setItem("iwp_zoom", String(col));
    const el = scrollRef.current;
    const prev = prevCol.current;
    if (el && prev !== col) {
      const centre = (el.scrollLeft + el.clientWidth / 2 - NAME_W) / prev;
      el.scrollLeft = Math.max(0, centre * col + NAME_W - el.clientWidth / 2);
    }
    prevCol.current = col;
  }, [col]);

  const zoom = (delta) => setCol((c) => Math.min(MAX_COL, Math.max(MIN_COL, c + delta)));

  const days = [];
  for (let d = start; d <= end; d++) days.push(d);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-2xl text-emerald-950 tracking-tight">Who's here when</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={() => zoom(-STEP)}
              disabled={col <= MIN_COL}
              aria-label="Zoom out"
              className="w-7 h-7 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 flex items-center justify-center"
            >
              <Icon name="minus" size={15} />
            </button>
            <button
              onClick={() => zoom(STEP)}
              disabled={col >= MAX_COL}
              aria-label="Zoom in"
              className="w-7 h-7 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 flex items-center justify-center"
            >
              <Icon name="plus" size={15} />
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500">
            {Object.values(COVERAGE).map((c) => (
              <span key={c.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="tl-scroll overflow-x-auto bg-white border border-stone-200 rounded-2xl">
        <div style={{ minWidth: NAME_W + nDays * col }}>
          {/* header */}
          <div className="flex h-11 border-b border-stone-100 sticky top-0 bg-white z-10">
            <div style={{ width: NAME_W, minWidth: NAME_W }} className="sticky left-0 bg-white z-10" />
            <div className="relative" style={{ width: nDays * col }}>
              {days.map((d, i) => {
                const date = new Date(d * 86400000);
                const isFirst = date.getUTCDate() === 1 || i === 0;
                return (
                  <React.Fragment key={d}>
                    {isFirst && (
                      <div className="absolute top-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500" style={{ left: i * col + 4 }}>
                        {date.toLocaleDateString("en-IE", { month: "long", timeZone: "UTC" })}
                      </div>
                    )}
                    <div
                      className={`absolute top-[21px] text-[10px] -translate-x-1/2 tabular-nums ${d === wedding ? "font-bold text-emerald-700" : "text-stone-500"}`}
                      style={{ left: i * col + col / 2 }}
                    >
                      {date.getUTCDate()}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* rows */}
          {guests.length === 0 && (
            <div className="px-4 py-12 text-center text-stone-400 text-sm">
              No travellers yet — add yourself from the sidebar to get started.
            </div>
          )}
          {guests.map((g, gi) => {
            const { segments } = guestCoverage(g, stops);
            const ga = toDay(g.arrive), gd = toDay(g.depart);
            return (
              <div
                key={g.id}
                className={`flex h-10 items-center hover:bg-stone-50 cursor-pointer ${gi > 0 ? "border-t border-stone-100" : ""}`}
                onClick={() => onPickGuest(g)}
              >
                <div style={{ width: NAME_W, minWidth: NAME_W }} className="sticky left-0 z-[5] bg-white pl-4 pr-2 truncate text-sm font-medium text-stone-700" title={g.name}>
                  {g.name}
                </div>
                <div className="relative h-full" style={{ width: nDays * col }}>
                  {/* grid */}
                  {days.map((d, i) => {
                    const dow = new Date(d * 86400000).getUTCDay();
                    return (
                      <div
                        key={d}
                        className={`absolute top-0 bottom-0 ${
                          d === wedding ? "bg-emerald-50/60" : [0, 6].includes(dow) ? "bg-stone-50/70" : ""
                        }`}
                        style={{
                          left: i * col,
                          width: col,
                          borderLeft: d === today ? "1.5px solid #fb7185" : "1px solid #f5f5f4",
                        }}
                      />
                    );
                  })}
                  {/* arrival/departure window */}
                  {ga != null && gd != null && (
                    <div className="absolute top-2 bottom-2 rounded-lg border border-dashed border-stone-200" style={{ left: x(ga), width: (gd - ga) * col }} />
                  )}
                  {/* coverage segments */}
                  {segments.map((s, idx) => {
                    const c = COVERAGE[s.status];
                    const w = (s.to - s.from) * col - 3;
                    return (
                      <div
                        key={idx}
                        className="absolute top-2 h-6 rounded-md flex items-center pl-1.5 pr-1 overflow-hidden"
                        style={{ left: x(s.from) + 1, width: w, background: c.bg, borderLeft: `2.5px solid ${c.color}` }}
                        title={`${c.label}${s.stop ? " · " + s.stop.name : ""} · ${fmt(dayToIso(s.from))}–${fmt(dayToIso(s.to))}`}
                      >
                        {(s.to - s.from) >= 2 && (
                          <span className="text-[10px] font-medium truncate" style={{ color: c.text }}>
                            {s.stop ? s.stop.name : c.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-stone-500 mt-3">Tap a row for that person's plan and what they still need to book. Use − / + to zoom.</p>

      {/* The plan — the rough itinerary, sitting under the timeline */}
      {itinerary.length > 0 && (
        <div className="mt-7">
          <h2 className="font-display text-2xl text-emerald-950 tracking-tight mb-1">The plan</h2>
          <p className="text-sm text-stone-500 mb-4">The rough itinerary for the trip.</p>
          <ul className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
            {itinerary.map((p, i) => {
              const c = ITINERARY_COLORS[i % ITINERARY_COLORS.length];
              return (
                <li key={p.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ background: c.border }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-800">{p.label}</div>
                    {p.note && <div className="text-xs text-stone-500 mt-0.5">{p.note}</div>}
                  </div>
                  <div className="text-sm text-stone-500 shrink-0 text-right">{fmt(p.from)} – {fmt(p.to)}</div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
