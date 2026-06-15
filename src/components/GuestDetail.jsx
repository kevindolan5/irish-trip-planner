import React from "react";
import { Modal, Btn } from "./common.jsx";
import { COVERAGE } from "../config.js";
import { guestCoverage, fmt, dayToIso, nights } from "../lib/dates.js";

export default function GuestDetail({ guest, stops, canEdit, onEdit, onClose }) {
  const { segments, summary } = guestCoverage(guest, stops);
  const toBook = summary["book-your-own"] + summary.gap;

  return (
    <Modal
      title={guest.name}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn onClick={() => onEdit(guest)}>{canEdit ? "Edit" : "Edit my dates"}</Btn>
        </>
      }
    >
      <div className="text-sm text-stone-600">
        In Ireland <span className="font-medium text-stone-800">{fmt(guest.arrive, { weekday: "short" })}</span> → <span className="font-medium text-stone-800">{fmt(guest.depart, { weekday: "short" })}</span>
        {" · "}{nights(guest.arrive, guest.depart)} nights{(Number(guest.partySize) || 1) > 1 ? ` · party of ${guest.partySize}` : ""}
      </div>
      {guest.notes && <p className="text-sm text-stone-500 bg-stone-50 rounded-xl px-3 py-2.5 leading-relaxed">{guest.notes}</p>}

      <div className="flex gap-2 flex-wrap">
        {summary.covered > 0 && <Chip c={COVERAGE.covered}>{summary.covered}n sorted</Chip>}
        {summary["book-your-own"] > 0 && <Chip c={COVERAGE["book-your-own"]}>{summary["book-your-own"]}n book your own</Chip>}
        {summary.gap > 0 && <Chip c={COVERAGE.gap}>{summary.gap}n nothing planned</Chip>}
      </div>

      <div>
        <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-[0.07em] mb-2.5">Your plan</div>
        {segments.length === 0 ? (
          <p className="text-sm text-stone-400">No nights to show.</p>
        ) : (
          <ol className="relative space-y-3 pl-4 border-l border-stone-150" style={{ borderColor: "#e7e5e4" }}>
            {segments.map((s, i) => {
              const c = COVERAGE[s.status];
              return (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ background: c.color }} />
                  <div className="text-stone-700">
                    <span className="font-medium">{fmt(dayToIso(s.from))} – {fmt(dayToIso(s.to))}</span>
                    <span className="text-stone-400"> · {s.to - s.from}n</span>
                  </div>
                  <div style={{ color: c.text }} className="font-medium">
                    {s.stop ? s.stop.name : "—"}
                    {s.status === "covered" && " · sorted"}
                    {s.status === "book-your-own" && " · book your own"}
                    {s.status === "gap" && " · nothing planned yet"}
                  </div>
                  {s.stop?.link && s.status === "book-your-own" && (
                    <a href={s.stop.link} target="_blank" rel="noopener" className="text-xs text-amber-700 font-medium hover:underline">Suggested link →</a>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {toBook > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 text-sm text-amber-900 leading-relaxed">
          <span className="font-semibold">You need to book your own place for {toBook} night{toBook === 1 ? "" : "s"}.</span> The amber and red legs above are on you.
        </div>
      )}
    </Modal>
  );
}

function Chip({ c, children }) {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-1" style={{ background: c.bg, color: c.text }}>
      {children}
    </span>
  );
}
