import React, { useState } from "react";
import { Modal, Field, inputCls, Btn } from "./common.jsx";
import { saveGuest, deleteGuest } from "../firebase.js";
import { APP } from "../config.js";

export default function GuestForm({ guest, onClose, canDelete }) {
  const [name, setName] = useState(guest?.name || "");
  const [arrive, setArrive] = useState(guest?.arrive || APP.rangeStart);
  const [depart, setDepart] = useState(guest?.depart || APP.weddingDate);
  const [partySize, setPartySize] = useState(guest?.partySize || 1);
  const [notes, setNotes] = useState(guest?.notes || "");
  const [busy, setBusy] = useState(false);

  const valid = name.trim() && arrive && depart && depart > arrive;

  async function submit() {
    if (!valid) return;
    setBusy(true);
    await saveGuest(guest?.id, {
      name: name.trim(),
      arrive,
      depart,
      partySize: Number(partySize) || 1,
      notes: notes.trim(),
    });
    onClose();
  }

  async function del() {
    if (!confirm(`Remove ${guest.name} from the planner?`)) return;
    setBusy(true);
    await deleteGuest(guest.id);
    onClose();
  }

  return (
    <Modal
      title={guest ? "Edit traveller" : "Add yourself / your group"}
      onClose={onClose}
      footer={
        <>
          {guest && canDelete && (
            <Btn variant="danger" onClick={del} disabled={busy} className="mr-auto">
              Delete
            </Btn>
          )}
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={submit} disabled={!valid || busy}>{busy ? "Saving…" : "Save"}</Btn>
        </>
      }
    >
      <Field label="Name / group">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mum & Dad, or The Hendersons" autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Arrive in Ireland">
          <input type="date" className={inputCls} value={arrive} min={APP.rangeStart} max={APP.rangeEnd} onChange={(e) => setArrive(e.target.value)} />
        </Field>
        <Field label="Leave Ireland">
          <input type="date" className={inputCls} value={depart} min={APP.rangeStart} max={APP.rangeEnd} onChange={(e) => setDepart(e.target.value)} />
        </Field>
      </div>
      {!valid && (name || arrive || depart) && (
        <p className="text-xs text-rose-600">Pop in a name and make sure the leaving date is after the arrival date.</p>
      )}
      <Field label="How many of you?">
        <input type="number" min="1" className={inputCls} value={partySize} onChange={(e) => setPartySize(e.target.value)} />
      </Field>
      <Field label="Notes (optional)" hint="Flights, who you're travelling with, a cot needed, anything.">
        <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
    </Modal>
  );
}
