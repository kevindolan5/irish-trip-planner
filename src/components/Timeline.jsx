import React, { useEffect, useRef } from "react";
import { APP, COVERAGE } from "../config.js";
import { toDay, dayToIso, fmt, guestCoverage, todayIso } from "../lib/dates.js";

const COL = 26; // px per day
const NAME_W = 150;

export default function Timeline({ guests, stops, onPickGuest }) {
  const scrollRef = useRef(null);

  const start = toDay(APP.rangeStart);
  const end = toDay(APP.rangeEnd);
  const nDays = end - start + 1;
  const wedding = toDay(APP.weddingDate);
  const today = toDay(todayIso());
  const x = (day) => (day - start) * COL;

  useEffect(() => {
    // start scrolled so the wedding (or today) is in view on narrow screens
    const el = scrollRef.current;
    if (!el) return;
    const focus = today >= start && today <= end ? today : wedding;
    el.scrollLeft = Math.max(0, x(focus) - el.clientWidth * 0.4);
  }, [guests.length, stops.length]);

  const days = [];
  for (let d = start; d <= end; d++) days.push(d);

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 text-xs text-stone-500">
        {Object.values(COVERAGE).map((c) => (
          <span key={c.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-200 border border-amber-400" />
          Wedding day
        </span>
      </div>

      <div ref={scrollRef} className="tl-scroll overflow-x-auto bg-white border border-stone-200 rounded-xl shadow-sm">
        <div style={{ minWidth: NAME_W + nDays * COL }}>
          {/* header */}
          <div className="flex h-10 border-b border-stone-100 sticky top-0 bg-white z-10">
            <div style={{ width: NAME_W, minWidth: NAME_W }} className="sticky left-0 bg-white z-10" />
            <div className="relative" style={{ width: nDays * COL }}>
              {days.map((d, i) => {
                const date = new Date(d * 86400000);
                const isFirst = date.getUTCDate() === 1 || i === 0;
                return (
                  <React.Fragment key={d}>
                    {isFirst && (
                      <div className="absolute top-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700" style={{ left: i * COL + 3 }}>
                        {date.toLocaleDateString("en-IE", { month: "long", timeZone: "UTC" })}
                      </div>
                    )}
                    <div
                      className={`absolute top-[19px] text-[10px] -translate-x-1/2 ${d === wedding ? "font-bold text-amber-600" : "text-stone-400"}`}
                      style={{ left: i * COL + COL / 2 }}
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
            <div className="px-4 py-10 text-center text-stone-400 text-sm">
              No travellers yet — add yourself from the sidebar to get started.
            </div>
          )}
          {guests.map((g) => {
            const { segments, summary } = guestCoverage(g, stops);
            const ga = toDay(g.arrive), gd = toDay(g.depart);
            return (
              <div key={g.id} className="flex h-9 items-center hover:bg-stone-50/70 cursor-pointer" onClick={() => onPickGuest(g)}>
                <div style={{ width: NAME_W, minWidth: NAME_W }} className="sticky left-0 z-[5] bg-white pl-3 pr-2 truncate text-sm font-semibold text-stone-700" title={g.name}>
                  {g.name}
                </div>
                <div className="relative h-full" style={{ width: nDays * COL }}>
                  {/* grid */}
                  {days.map((d, i) => (
                    <div
                      key={d}
                      className={`absolute top-0 bottom-0 border-l ${
                        d === wedding ? "bg-amber-50 border-amber-200" : [0, 6].includes(new Date(d * 86400000).getUTCDay()) ? "bg-stone-50 border-stone-100" : "border-stone-100"
                      } ${d === today ? "!border-l-2 !border-rose-400" : ""}`}
                      style={{ left: i * COL, width: COL }}
                    />
                  ))}
                  {/* arrival/departure outline */}
                  {ga != null && gd != null && (
                    <div className="absolute top-1.5 bottom-1.5 rounded-md border border-dashed border-stone-300" style={{ left: x(ga), width: (gd - ga) * COL }} />
                  )}
                  {/* coverage segments */}
                  {segments.map((s, idx) => {
                    const c = COVERAGE[s.status];
                    return (
                      <div
                        key={idx}
                        className="absolute top-1.5 h-6 rounded-md flex items-center px-1 overflow-hidden"
                        style={{ left: x(s.from), width: (s.to - s.from) * COL - 2, background: c.bg, border: `1px solid ${c.color}` }}
                        title={`${c.label}${s.stop ? " · " + s.stop.name : ""} · ${fmt(dayToIso(s.from))}–${fmt(dayToIso(s.to))}`}
                      >
                        {(s.to - s.from) >= 2 && (
                          <span className="text-[10px] font-semibold truncate" style={{ color: c.text }}>
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
      <p className="text-xs text-stone-400 mt-2">Tap a row for that person's plan and what they still need to book.</p>
    </div>
  );
}
