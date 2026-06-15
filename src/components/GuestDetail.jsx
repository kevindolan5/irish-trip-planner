import React from "react";
import { Modal, Btn } from "./common.jsx";
import { COVERAGE } from "../config.js";
import { guestCoverage, fmt, dayToIso, nights } from "../lib/dates.js";

export default function GuestDetail({ guest, stops, canEdit, onEdit, onClose }) {
  const { segments, summary } = guestCoverage(guest, stops);

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
        In Ireland <b>{fmt(guest.arrive, { weekday: "short" })}</b> → <b>{fmt(guest.depart, { weekday: "short" })}</b>
        {" "}· {nights(guest.arrive, guest.depart)} nights{(Number(guest.partySize) || 1) > 1 ? ` · party of ${guest.partySize}` : ""}
      </div>
      {guest.notes && <p className="text-sm text-stone-500 bg-stone-50 rounded-lg px-3 py-2">{guest.notes}</p>}

      {/* summary chips */}
      <div className="flex gap-2 flex-wrap">
        {summary.covered > 0 && <Chip c={COVERAGE.covered}>{summary.covered}n sorted</Chip>}
        {summary["book-your-own"] > 0 && <Chip c={COVERAGE["book-your-own"]}>{summary["book-your-own"]}n book your own</Chip>}
        {summary.gap > 0 && <Chip c={COVERAGE.gap}>{summary.gap}n nothing planned</Chip>}
      </div>

      {/* the plan, leg by leg */}
      <div>
        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Your plan</div>
        {segments.length === 0 ? (
          <p className="text-sm text-stone-400">No nights to show.</p>
        ) : (
          <ol className="space-y-1.5">
            {segments.map((s, i) => {
              const c = COVERAGE[s.status];
              return (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: c.color }} />
                  <div>
                    <div className="text-stone-700">
                      <b>{fmt(dayToIso(s.from))} – {fmt(dayToIso(s.to))}</b>
                      <span className="text-stone-400"> · {s.to - s.from}n</span>
                    </div>
                    <div style={{ color: c.text }} className="font-medium">
                      {s.stop ? s.stop.name : "—"}
                      {s.status === "covered" && " — sorted, nothing to book"}
                      {s.status === "book-your-own" && " — book your own"}
                      {s.status === "gap" && " — nothing planned yet"}
                    </div>
                    {s.stop?.link && s.status === "book-your-own" && (
                      <a href={s.stop.link} target="_blank" rel="noopener" className="text-xs text-amber-700 font-semibold">Suggested link →</a>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {(summary["book-your-own"] > 0 || summary.gap > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-amber-900">
          <b>You need to book your own place for {summary["book-your-own"] + summary.gap} night{summary["book-your-own"] + summary.gap === 1 ? "" : "s"}.</b> The amber/red legs above are on you.
        </div>
      )}
    </Modal>
  );
}

function Chip({ c, children }) {
  return (
    <span className="text-xs font-semibold rounded-full px-2.5 py-1" style={{ background: c.bg, color: c.text }}>
      {children}
    </span>
  );
}
