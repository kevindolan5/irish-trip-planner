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
    const el = scrollRef.current;
    if (!el) return;
    const focus = today >= start && today <= end ? today : wedding;
    el.scrollLeft = Math.max(0, x(focus) - el.clientWidth * 0.4);
  }, [guests.length, stops.length]);

  const days = [];
  for (let d = start; d <= end; d++) days.push(d);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-2xl text-emerald-950 tracking-tight">Who's here when</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500">
          {Object.values(COVERAGE).map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
              {c.label}
            </span>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="tl-scroll overflow-x-auto bg-white border border-stone-200 rounded-2xl">
        <div style={{ minWidth: NAME_W + nDays * COL }}>
          {/* header */}
          <div className="flex h-11 border-b border-stone-100 sticky top-0 bg-white z-10">
            <div style={{ width: NAME_W, minWidth: NAME_W }} className="sticky left-0 bg-white z-10" />
            <div className="relative" style={{ width: nDays * COL }}>
              {days.map((d, i) => {
                const date = new Date(d * 86400000);
                const isFirst = date.getUTCDate() === 1 || i === 0;
                return (
                  <React.Fragment key={d}>
                    {isFirst && (
                      <div className="absolute top-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500" style={{ left: i * COL + 4 }}>
                        {date.toLocaleDateString("en-IE", { month: "long", timeZone: "UTC" })}
                      </div>
                    )}
                    <div
                      className={`absolute top-[21px] text-[10px] -translate-x-1/2 tabular-nums ${d === wedding ? "font-bold text-emerald-700" : "text-stone-500"}`}
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
                <div style={{ width: NAME_W, minWidth: NAME_W }} className="sticky left-0 z-[5] bg-white group-hover:bg-stone-50 pl-4 pr-2 truncate text-sm font-medium text-stone-700" title={g.name}>
                  {g.name}
                </div>
                <div className="relative h-full" style={{ width: nDays * COL }}>
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
                          left: i * COL,
                          width: COL,
                          borderLeft: d === today ? "1.5px solid #fb7185" : "1px solid #f5f5f4",
                        }}
                      />
                    );
                  })}
                  {/* arrival/departure window */}
                  {ga != null && gd != null && (
                    <div className="absolute top-2 bottom-2 rounded-lg border border-dashed border-stone-200" style={{ left: x(ga), width: (gd - ga) * COL }} />
                  )}
                  {/* coverage segments */}
                  {segments.map((s, idx) => {
                    const c = COVERAGE[s.status];
                    const w = (s.to - s.from) * COL - 3;
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
      <p className="text-xs text-stone-500 mt-3">Tap a row for that person's plan and what they still need to book.</p>
    </div>
  );
}
