// All dates are ISO "YYYY-MM-DD" strings, handled at UTC midnight to dodge DST.

const MS = 86400000;

export function toDay(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return null;
  return Date.UTC(y, m - 1, d) / MS;
}

export function dayToIso(day) {
  return new Date(day * MS).toISOString().slice(0, 10);
}

export function fmt(iso, opts) {
  const day = toDay(iso);
  if (day == null) return "";
  return new Date(day * MS).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    ...opts,
  });
}

export function todayIso() {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())).toISOString().slice(0, 10);
}

export function nights(fromIso, toIso) {
  const a = toDay(fromIso), b = toDay(toIso);
  if (a == null || b == null) return 0;
  return Math.max(0, b - a);
}

// All day-numbers in [startIso, endIso] inclusive.
export function dayRange(startIso, endIso) {
  const a = toDay(startIso), b = toDay(endIso);
  const out = [];
  for (let d = a; d <= b; d++) out.push(d);
  return out;
}

// The dates a guest is actually at a stop: their custom sub-range if set,
// otherwise the stop's own range. Returns ISO strings + day numbers.
export function stayRange(stop, guestId) {
  const a = stop.guestIds && stop.guestIds[guestId];
  const fromIso = a && a.from ? a.from : stop.from;
  const toIso = a && a.to ? a.to : stop.to;
  return { fromIso, toIso, from: toDay(fromIso), to: toDay(toIso) };
}

// Most beds needed at once across a stop's nights (so sequential stays in the
// same house don't read as over capacity).
export function peakOccupancy(stop, guests) {
  const ids = Object.keys(stop.guestIds || {});
  if (!ids.length) return 0;
  const sizeOf = Object.fromEntries(guests.map((g) => [g.id, Number(g.partySize) || 1]));
  const sFrom = toDay(stop.from), sTo = toDay(stop.to);
  if (sFrom == null || sTo == null) return ids.reduce((n, id) => n + (sizeOf[id] || 1), 0);
  let peak = 0;
  for (let n = sFrom; n < sTo; n++) {
    let c = 0;
    for (const id of ids) {
      const r = stayRange(stop, id);
      if (r.from != null && r.to != null && r.from <= n && n < r.to) c += sizeOf[id] || 1;
    }
    peak = Math.max(peak, c);
  }
  return peak;
}

// ---- coverage ---------------------------------------------------------------
// For a guest, work out the status of each night between arrive and depart.
// A "night" of day N means the night starting on day N (checkout day = depart, exclusive).
// Returns { nights: [{day, status, stop}], segments: [{from,to,status,stop}], summary }.

export function guestCoverage(guest, stops) {
  const a = toDay(guest.arrive);
  const d = toDay(guest.depart);
  if (a == null || d == null || d <= a) {
    return { nights: [], segments: [], summary: { covered: 0, "book-your-own": 0, gap: 0, total: 0 } };
  }

  const beds = stops
    .filter((s) => s.type !== "activity" && s.guestIds && s.guestIds[guest.id])
    .map((s) => ({ stop: s, range: stayRange(s, guest.id) }))
    .filter((b) => b.range.from != null && b.range.to != null);

  const nightsArr = [];
  for (let n = a; n < d; n++) {
    let status = "gap";
    let stop = null;
    for (const b of beds) {
      if (b.range.from <= n && n < b.range.to) {
        stop = b.stop;
        status = b.stop.type === "covered" ? "covered" : "book-your-own";
        break;
      }
    }
    nightsArr.push({ day: n, status, stop });
  }

  // collapse consecutive nights with same status + stop into segments
  const segments = [];
  for (const nt of nightsArr) {
    const last = segments[segments.length - 1];
    if (last && last.status === nt.status && last.stopId === (nt.stop ? nt.stop.id : null)) {
      last.to = nt.day + 1;
    } else {
      segments.push({ from: nt.day, to: nt.day + 1, status: nt.status, stop: nt.stop, stopId: nt.stop ? nt.stop.id : null });
    }
  }

  const summary = { covered: 0, "book-your-own": 0, gap: 0, total: nightsArr.length };
  for (const nt of nightsArr) summary[nt.status]++;

  return { nights: nightsArr, segments, summary };
}
