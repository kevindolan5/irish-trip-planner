import React, { useState } from "react";
import { Modal, Field, inputCls, Btn } from "./common.jsx";
import { saveRoute, deleteRoute } from "../firebase.js";
import { labelLatLng, driveEstimate, formatDuration } from "../lib/route.js";
import { geocode } from "../lib/geocode.js";
import { AREAS } from "../lib/areas.js";

export default function RouteForm({ route, stops, onClose }) {
  const [from, setFrom] = useState(route?.from || "");
  const [to, setTo] = useState(route?.to || "");
  const [duration, setDuration] = useState(route?.duration || "");
  const [km, setKm] = useState(route?.km ?? "");
  const [note, setNote] = useState(route?.note || "");
  const [est, setEst] = useState("idle"); // idle | working | fail
  const [busy, setBusy] = useState(false);

  const valid = from.trim() && to.trim();

  // a known stop/town, else geocode the place name
  async function resolve(label) {
    const direct = labelLatLng(label, stops);
    if (direct) return direct;
    const g = await geocode(label);
    return g ? [g.lat, g.lng] : null;
  }

  async function estimate() {
    setEst("working");
    try {
      const [a, b] = await Promise.all([resolve(from), resolve(to)]);
      if (!a || !b) { setEst("fail"); return; }
      const r = await driveEstimate(a, b);
      if (r) {
        setDuration(formatDuration(r.mins));
        setKm(r.km);
        setEst("idle");
      } else setEst("fail");
    } catch {
      setEst("fail");
    }
  }

  async function submit() {
    if (!valid) return;
    setBusy(true);
    await saveRoute(route?.id, {
      from: from.trim(),
      to: to.trim(),
      duration: duration.trim(),
      km: km === "" ? null : Number(km),
      note: note.trim(),
    });
    onClose();
  }

  async function del() {
    if (!confirm(`Delete ${route.from} → ${route.to}?`)) return;
    setBusy(true);
    await deleteRoute(route.id);
    onClose();
  }

  // suggestions: existing stop names + known towns
  const places = [...new Set([...stops.map((s) => s.name), ...Object.keys(AREAS).map((a) => a.replace(/\b\w/g, (c) => c.toUpperCase()))])];

  return (
    <Modal
      title={route ? "Edit route" : "Add a route"}
      onClose={onClose}
      footer={
        <>
          {route && <Btn variant="danger" onClick={del} disabled={busy} className="mr-auto">Delete</Btn>}
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={submit} disabled={!valid || busy}>{busy ? "Saving…" : "Save"}</Btn>
        </>
      }
    >
      <datalist id="place-list">
        {places.map((p) => <option key={p} value={p} />)}
      </datalist>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From">
          <input className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} list="place-list" placeholder="e.g. Dublin" autoFocus />
        </Field>
        <Field label="To">
          <input className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} list="place-list" placeholder="e.g. Ennis" />
        </Field>
      </div>

      <div>
        <Btn variant="outline" onClick={estimate} disabled={!valid || est === "working"} className="!py-1.5 text-xs">
          {est === "working" ? "Estimating…" : "Estimate drive time"}
        </Btn>
        {est === "fail" && (
          <span className="block text-xs text-amber-700 mt-1.5 leading-snug">Couldn't auto-estimate — use a stop name or known town at both ends, or just type a rough time below.</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Time" hint="Rough is fine.">
          <input className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 2 hr 30 min" />
        </Field>
        <Field label="Distance (km, optional)">
          <input type="number" min="0" className={inputCls} value={km} onChange={(e) => setKm(e.target.value)} placeholder="e.g. 180" />
        </Field>
      </div>

      <Field label="Note (optional)" hint="Mode or routing, e.g. “via M18”, “ferry”, “train from Heuston”.">
        <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </Modal>
  );
}
