import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  update,
  remove,
  push,
  child,
  set,
} from "firebase/database";
import { firebaseConfig, DB_ROOT } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const rootRef = ref(db, DB_ROOT);

// ---- live subscriptions -----------------------------------------------------

// Returns an unsubscribe fn. Hands back a {id, ...} array, sorted by `sortKey`.
function subscribeCollection(name, cb, sortKey) {
  const r = child(rootRef, name);
  return onValue(r, (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val).map(([id, v]) => ({ id, ...v }));
    if (sortKey) {
      list.sort((a, b) => String(a[sortKey] || "").localeCompare(String(b[sortKey] || "")));
    }
    cb(list);
  });
}

export const subscribeGuests = (cb) => subscribeCollection("guests", cb, "arrive");
export const subscribeStops = (cb) => subscribeCollection("stops", cb, "from");

// ---- writes -----------------------------------------------------------------

export function saveGuest(id, data) {
  const r = id ? child(rootRef, `guests/${id}`) : push(child(rootRef, "guests"));
  return id ? update(r, data) : set(r, data);
}

export function deleteGuest(id) {
  return remove(child(rootRef, `guests/${id}`));
}

export function saveStop(id, data) {
  const r = id ? child(rootRef, `stops/${id}`) : push(child(rootRef, "stops"));
  return id ? update(r, data) : set(r, data);
}

export function deleteStop(id) {
  return remove(child(rootRef, `stops/${id}`));
}

// Assign / unassign a guest to a stop (stored as a set under the stop).
export function setAssignment(stopId, guestId, on) {
  return set(child(rootRef, `stops/${stopId}/guestIds/${guestId}`), on ? true : null);
}

export { db };
