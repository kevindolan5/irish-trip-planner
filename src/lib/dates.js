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

  const beds = stops.filter(
    (s) => s.type !== "activity" && s.guestIds && s.guestIds[guest.id] && toDay(s.from) != null && toDay(s.to) != null
  );

  const nightsArr = [];
  for (let n = a; n < d; n++) {
    let status = "gap";
    let stop = null;
    for (const s of beds) {
      if (toDay(s.from) <= n && n < toDay(s.to)) {
        stop = s;
        status = s.type === "covered" ? "covered" : "book-your-own";
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
