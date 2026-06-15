# Our Ireland Trip — wedding travel planner

A small web app for the crew flying in around the wedding (3 Oct 2026). It answers
the two questions everyone keeps asking:

1. **Where am I sleeping, and when?**
2. **Which nights do I need to book my own place?**

Built to match the [guestplanner](https://guestplanner.kevindolan.ie/) site —
React + Vite + Tailwind, with live data in the same Firebase project.

## Three views

- **Timeline** — one row per traveller across the whole window, coloured by
  coverage: 🟢 sorted · 🟠 book your own · 🔴 nothing planned. Wedding day highlighted.
  Tap a row for that person's leg-by-leg plan and a "you need to book X nights" summary.
- **Map** — every stop pinned on Ireland, colour-coded, with who's staying where.
- **Organise** (you only, behind a password) — add the places you've sorted, then
  drag people into them. Anything not covered shows up as "book your own".

## Who can do what

- **Anyone** can add themselves and edit their own arrival/departure dates.
- **You** (organiser) unlock the Organise tab with the password in
  [`src/config.js`](src/config.js) → `APP.adminPassword` (currently `claddagh` — change it).
  This is a soft gate to keep the UI tidy, not real security.

## Data

Lives in your existing Firebase Realtime Database (`guest-accommodation`), isolated
under the top-level key **`irishWeddingPlanner`** — it never touches the
wedding-seating data. Edits sync live for everyone, no refresh needed.

There's example data in there now (Mum & Dad, Sarah & Tom, etc.) so the app isn't
empty — just delete or edit it when you add the real people and places.

### Stop types

| Type | Means | Colour |
|------|-------|--------|
| **Sorted for you** | beds are covered (family house, block booking) | green |
| **Book your own** | this is the plan/area, but they book it themselves | amber |
| **Thing to do** | a recommendation; shows on the map only | violet |

## Run it

```bash
npm install
npm run dev      # http://localhost:8742
```

## Deploy (free)

It's a static build — host it anywhere, same as guestplanner.

```bash
npm run build    # outputs to dist/
```

Then drag `dist/` onto https://app.netlify.com/drop, or push to GitHub and point
Netlify/Vercel/GitHub Pages at it. Because the data is in Firebase, you only
redeploy when the *code* changes — adding people/stops happens live in the app.

## Tweak

Almost everything lives in [`src/config.js`](src/config.js): title, subtitle,
wedding date, the date window, the admin password, and the colours/labels for
stop types. Add new towns to the map lookup in [`src/lib/areas.js`](src/lib/areas.js).
