import React, { useState } from "react";
import { Modal, Field, inputCls, Btn } from "./common.jsx";
import { saveStop, deleteStop } from "../firebase.js";
import { APP, STOP_TYPES } from "../config.js";
import { AREAS } from "../lib/areas.js";
import { geocode, parseCoords } from "../lib/geocode.js";
import Icon from "./icons.jsx";

export default function StopForm({ stop, onClose }) {
  const [name, setName] = useState(stop?.name || "");
  const [type, setType] = useState(stop?.type || "covered");
  const [address, setAddress] = useState(stop?.address || "");
  const [area, setArea] = useState(stop?.area || "");
  const [from, setFrom] = useState(stop?.from || APP.rangeStart);
  const [to, setTo] = useState(stop?.to || APP.weddingDate);
  const [capacity, setCapacity] = useState(stop?.capacity || "");
  const [link, setLink] = useState(stop?.link || "");
  const [notes, setNotes] = useState(stop?.notes || "");
  const [pin, setPin] = useState(stop?.lat != null ? `${stop.lat}, ${stop.lng}` : "");
  const [geoResult, setGeoResult] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | searching | fail
  const [busy, setBusy] = useState(false);

  const isActivity = type === "activity";
  const valid = name.trim() && (isActivity || (from && to && to > from));

  // A pasted link/coords (exact) wins; otherwise the geocoded address result.
  const exact = parseCoords(pin);
  const coords = exact || (geoResult ? { lat: geoResult.lat, lng: geoResult.lng } : null);

  async function locate() {
    const q = address.trim() || [name.trim(), area.trim()].filter(Boolean).join(", ");
    if (!q) return;
    setPin(""); // "use the address instead"
    setGeoResult(null);
    setGeoStatus("searching");
    try {
      const hit = await geocode(q);
      if (hit) {
        setGeoResult(hit);
        setGeoStatus("ok");
      } else {
        setGeoStatus("fail");
      }
    } catch {
      setGeoStatus("fail");
    }
  }

  async function submit() {
    if (!valid) return;
    setBusy(true);
    const data = {
      name: name.trim(),
      type,
      address: address.trim(),
      area: area.trim(),
      lat: coords ? coords.lat : null,
      lng: coords ? coords.lng : null,
      link: link.trim(),
      notes: notes.trim(),
    };
    if (!isActivity) {
      data.from = from;
      data.to = to;
      data.capacity = capacity === "" ? null : Number(capacity);
    } else {
      data.from = null;
      data.to = null;
      data.capacity = null;
    }
    await saveStop(stop?.id, data);
    onClose();
  }

  async function del() {
    if (!confirm(`Delete "${stop.name}"? Anyone assigned to it will lose their booking here.`)) return;
    setBusy(true);
    await deleteStop(stop.id);
    onClose();
  }

  const areaList = Object.keys(AREAS).sort();

  return (
    <Modal
      title={stop ? "Edit stop" : "Add a stop"}
      onClose={onClose}
      footer={
        <>
          {stop && <Btn variant="danger" onClick={del} disabled={busy} className="mr-auto">Delete</Btn>}
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={submit} disabled={!valid || busy}>{busy ? "Saving…" : "Save"}</Btn>
        </>
      }
    >
      <Field label="What is it?">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(STOP_TYPES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => setType(key)}
              className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border text-xs font-medium text-center transition-colors ${
                type === key ? "border-transparent text-white" : "border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
              style={type === key ? { background: t.color } : {}}
            >
              <Icon name={t.icon} size={18} />
              {t.short}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-500 mt-1.5">{STOP_TYPES[type].blurb}</p>
      </Field>

      <Field label="Name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={isActivity ? "e.g. Cliffs of Moher" : "e.g. Galway Airbnb, Mary's house"} autoFocus />
      </Field>

      <Field label="Address" hint="Full street address or Eircode — guests see this and use it for Directions (Google Maps handles Eircodes). Hit Locate to drop a map pin.">
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 30 Westfields, Clare Road, Ennis, V95 X6NE"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), locate())}
          />
          <Btn variant="outline" onClick={locate} disabled={geoStatus === "searching"} className="shrink-0">
            {geoStatus === "searching" ? "…" : "Locate"}
          </Btn>
        </div>
        {geoStatus === "ok" && geoResult && !geoResult.approx && (
          <span className="flex items-start gap-1.5 text-xs text-emerald-700 mt-1.5">
            <Icon name="map" size={13} className="mt-0.5 shrink-0" />
            <span className="leading-snug">Pinned: {geoResult.label}</span>
          </span>
        )}
        {geoStatus === "ok" && geoResult && geoResult.approx && (
          <span className="block text-xs text-amber-700 mt-1.5 leading-snug">
            Pinned near <b>{geoResult.label}</b> — house numbers and Eircodes can't be matched. For an exact spot, paste a Google Maps link below.
          </span>
        )}
        {geoStatus === "fail" && (
          <span className="block text-xs text-amber-700 mt-1.5 leading-snug">Couldn't place that address. Paste a Google Maps link or coordinates below for an exact pin.</span>
        )}
      </Field>

      <Field
        label="Exact pin (optional)"
        hint="Best for Eircodes: open Google Maps, search the address, copy the link (or right-click the spot → click the coordinates to copy), and paste it here."
      >
        <input
          className={inputCls}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Google Maps link, or 52.838, -8.983"
        />
        {exact && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 mt-1.5">
            <Icon name="map" size={13} className="shrink-0" />
            Exact pin set ({exact.lat.toFixed(4)}, {exact.lng.toFixed(4)})
          </span>
        )}
        {pin && !exact && (
          <span className="block text-xs text-amber-700 mt-1.5 leading-snug">
            Couldn't read coordinates from that. Paste the full Google Maps URL (the one containing <code>@53.2,-9.0</code>) or plain <code>lat, lng</code>.
          </span>
        )}
      </Field>

      <Field label="Town / area" hint="Used to group stops and as a map fallback if nothing above pins it.">
        <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} list="area-list" placeholder="e.g. Ennis" />
        <datalist id="area-list">
          {areaList.map((a) => <option key={a} value={a.replace(/\b\w/g, (c) => c.toUpperCase())} />)}
        </datalist>
      </Field>

      {!isActivity && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check in">
              <input type="date" className={inputCls} value={from} min={APP.rangeStart} max={APP.rangeEnd} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="Check out">
              <input type="date" className={inputCls} value={to} min={APP.rangeStart} max={APP.rangeEnd} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
          <Field label="Beds / capacity (optional)" hint="Leave blank if it doesn't matter. Used to warn when a place is over-full.">
            <input type="number" min="1" className={inputCls} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </Field>
        </>
      )}

      <Field label="Link (optional)" hint="Airbnb listing, hotel booking page, official website…">
        <input className={inputCls} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
      </Field>
      <Field label="Notes (optional)">
        <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Check-in time, who to contact, parking…" />
      </Field>
    </Modal>
  );
}
