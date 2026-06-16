import React, { useState } from "react";
import { Modal, Field, inputCls, Btn } from "./common.jsx";
import { saveItineraryItem, deleteItineraryItem } from "../firebase.js";
import { APP } from "../config.js";

export default function ItineraryForm({ item, onClose }) {
  const [label, setLabel] = useState(item?.label || "");
  const [from, setFrom] = useState(item?.from || APP.rangeStart);
  const [to, setTo] = useState(item?.to || APP.weddingDate);
  const [note, setNote] = useState(item?.note || "");
  const [busy, setBusy] = useState(false);

  const valid = label.trim() && from && to && to >= from;

  async function submit() {
    if (!valid) return;
    setBusy(true);
    await saveItineraryItem(item?.id, { label: label.trim(), from, to, note: note.trim() });
    onClose();
  }

  async function del() {
    if (!confirm(`Delete "${item.label}" from the plan?`)) return;
    setBusy(true);
    await deleteItineraryItem(item.id);
    onClose();
  }

  return (
    <Modal
      title={item ? "Edit phase" : "Add to the plan"}
      onClose={onClose}
      footer={
        <>
          {item && <Btn variant="danger" onClick={del} disabled={busy} className="mr-auto">Delete</Btn>}
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={submit} disabled={!valid || busy}>{busy ? "Saving…" : "Save"}</Btn>
        </>
      }
    >
      <Field label="What's happening" hint="The rough plan for this stretch.">
        <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Around Ennis, Wedding weekend, Kerry" autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From">
          <input type="date" className={inputCls} value={from} min={APP.rangeStart} max={APP.rangeEnd} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <input type="date" className={inputCls} value={to} min={APP.rangeStart} max={APP.rangeEnd} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>
      <Field label="Note (optional)">
        <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything worth flagging for this stretch." />
      </Field>
    </Modal>
  );
}
