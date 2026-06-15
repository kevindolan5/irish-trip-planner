import React, { useState } from "react";
import { Modal, Field, inputCls, Btn } from "./common.jsx";
import { saveStop, deleteStop } from "../firebase.js";
import { APP, STOP_TYPES } from "../config.js";
import { AREAS } from "../lib/areas.js";
import { geocode } from "../lib/geocode.js";
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
  const [lat, setLat] = useState(stop?.lat ?? null);
  const [lng, setLng] = useState(stop?.lng ?? null);
  const [geo, setGeo] = useState(stop?.lat != null ? { status: "ok", label: stop.address || "Pinned" } : { status: "idle" });
  const [busy, setBusy] = useState(false);

  const isActivity = type === "activity";
  const valid = name.trim() && (isActivity || (from && to && to > from));

  async function locate() {
    const q = address.trim() || [name.trim(), area.trim(), "Ireland"].filter(Boolean).join(", ");
    if (!q) return;
    setGeo({ status: "searching" });
    try {
      const hit = await geocode(q);
      if (hit) {
        setLat(hit.lat);
        setLng(hit.lng);
        setGeo({ status: "ok", label: hit.label });
      } else {
        setGeo({ status: "fail" });
      }
    } catch {
      setGeo({ status: "fail" });
    }
  }

  // typing a new address invalidates the previous pin
  function onAddressChange(v) {
    setAddress(v);
    if (geo.status === "ok") {
      setGeo({ status: "idle" });
      setLat(null);
      setLng(null);
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
      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,
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

      <Field label="Address" hint="Full street address or Eircode — guests will use this to find the place. Hit Locate to pin it exactly on the map.">
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="e.g. 12 Sea Road, Galway, H91 ABC1"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), locate())}
          />
          <Btn variant="outline" onClick={locate} disabled={geo.status === "searching"} className="shrink-0">
            {geo.status === "searching" ? "…" : "Locate"}
          </Btn>
        </div>
        {geo.status === "ok" && (
          <span className="flex items-start gap-1.5 text-xs text-emerald-700 mt-1.5">
            <Icon name="map" size={13} className="mt-0.5 shrink-0" />
            <span className="leading-snug">Pinned: {geo.label}</span>
          </span>
        )}
        {geo.status === "fail" && (
          <span className="block text-xs text-amber-700 mt-1.5">Couldn't find that exactly — try a fuller address, or set the town below and we'll place it there.</span>
        )}
      </Field>

      <Field label="Town / area" hint="Used to group stops and as a map fallback if the address can't be pinned.">
        <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} list="area-list" placeholder="e.g. Galway" />
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
