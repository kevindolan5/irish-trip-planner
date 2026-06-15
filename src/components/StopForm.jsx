import React, { useState } from "react";
import { Modal, Field, inputCls, Btn } from "./common.jsx";
import { saveStop, deleteStop } from "../firebase.js";
import { APP, STOP_TYPES } from "../config.js";
import { AREAS } from "../lib/areas.js";

export default function StopForm({ stop, onClose }) {
  const [name, setName] = useState(stop?.name || "");
  const [type, setType] = useState(stop?.type || "covered");
  const [area, setArea] = useState(stop?.area || "");
  const [from, setFrom] = useState(stop?.from || APP.rangeStart);
  const [to, setTo] = useState(stop?.to || APP.weddingDate);
  const [capacity, setCapacity] = useState(stop?.capacity || "");
  const [link, setLink] = useState(stop?.link || "");
  const [notes, setNotes] = useState(stop?.notes || "");
  const [busy, setBusy] = useState(false);

  const isActivity = type === "activity";
  const valid = name.trim() && (isActivity || (from && to && to > from));

  async function submit() {
    if (!valid) return;
    setBusy(true);
    const data = {
      name: name.trim(),
      type,
      area: area.trim(),
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
          {stop && (
            <Btn variant="danger" onClick={del} disabled={busy} className="mr-auto">Delete</Btn>
          )}
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
              className={`px-2 py-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                type === key ? "border-transparent text-white" : "border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
              style={type === key ? { background: t.color } : {}}
            >
              <div className="text-base">{t.icon}</div>
              {t.short}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-1.5">{STOP_TYPES[type].blurb}</p>
      </Field>

      <Field label="Name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={isActivity ? "e.g. Cliffs of Moher" : "e.g. Galway Airbnb, Mary's house"} autoFocus />
      </Field>

      <Field label="Area / town" hint="Used to place it on the map. Pick a known town and you can skip coordinates.">
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

      <Field label="Link (optional)" hint="Airbnb listing, hotel booking page, Google Maps…">
        <input className={inputCls} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
      </Field>
      <Field label="Notes (optional)">
        <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Eircode, check-in time, who to contact…" />
      </Field>
    </Modal>
  );
}
