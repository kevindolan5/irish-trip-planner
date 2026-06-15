import React, { useEffect, useState } from "react";
import { APP } from "./config.js";
import { subscribeGuests, subscribeStops } from "./firebase.js";
import { toDay, todayIso, fmt } from "./lib/dates.js";
import Sidebar from "./components/Sidebar.jsx";
import Timeline from "./components/Timeline.jsx";
import MapView from "./components/MapView.jsx";
import OrganiseBoard from "./components/OrganiseBoard.jsx";
import GuestForm from "./components/GuestForm.jsx";
import StopForm from "./components/StopForm.jsx";
import GuestDetail from "./components/GuestDetail.jsx";
import { Btn } from "./components/common.jsx";

const VIEWS = [
  { key: "timeline", label: "Timeline", icon: "📅" },
  { key: "map", label: "Map", icon: "🗺️" },
  { key: "organise", label: "Organise", icon: "🛏️", adminHint: true },
];

function Countdown() {
  const days = toDay(APP.weddingDate) - toDay(todayIso());
  const text =
    days > 1 ? `${days} days to go` :
    days === 1 ? "Tomorrow!" :
    days === 0 ? "Today! 🎉" :
    `${-days} days married`;
  return (
    <span className="text-xs sm:text-sm bg-white/15 border border-white/25 rounded-full px-3 py-1 font-semibold whitespace-nowrap">
      💍 {fmt(APP.weddingDate, { weekday: "short", year: "numeric" })} · {text}
    </span>
  );
}

export default function App() {
  const [guests, setGuests] = useState([]);
  const [stops, setStops] = useState([]);
  const [view, setView] = useState("timeline");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("iwp_admin") === "1");
  const [editGuest, setEditGuest] = useState(undefined); // undefined = closed, null = new
  const [detailGuest, setDetailGuest] = useState(null);
  const [editStop, setEditStop] = useState(undefined);
  const [dragGuestId, setDragGuestId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u1 = subscribeGuests(setGuests);
    const u2 = subscribeStops(setStops);
    return () => { u1(); u2(); };
  }, []);

  function toggleAdmin() {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.removeItem("iwp_admin");
      if (view === "organise") setView("timeline");
      return;
    }
    const pw = prompt("Organiser password:");
    if (pw == null) return;
    if (pw === APP.adminPassword) {
      setIsAdmin(true);
      localStorage.setItem("iwp_admin", "1");
      setView("organise");
    } else {
      alert("Not quite — try again.");
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* top bar */}
      <header className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <button className="sm:hidden text-white/80 text-xl" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg sm:text-2xl font-bold leading-tight truncate">☘️ {APP.title}</h1>
            <p className="text-xs text-white/70 hidden sm:block truncate">{APP.subtitle}</p>
          </div>
          <Countdown />
        </div>
        <div className="px-2 sm:px-4 flex items-center gap-1 border-t border-white/10">
          {VIEWS.filter((v) => v.key !== "organise" || isAdmin).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                view === v.key ? "border-amber-400 text-white" : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              <span className="mr-1">{v.icon}</span>{v.label}
            </button>
          ))}
          <button
            onClick={toggleAdmin}
            className="ml-auto text-xs text-white/60 hover:text-white px-2 py-2"
            title={isAdmin ? "You're in organiser mode" : "Unlock organiser controls"}
          >
            {isAdmin ? "Organiser ✓" : "Organiser login"}
          </button>
        </div>
      </header>

      {/* body */}
      <div className="flex-1 flex min-h-0">
        {/* sidebar */}
        <aside
          className={`bg-white border-r border-stone-200 w-72 shrink-0 z-20 ${
            sidebarOpen ? "fixed inset-y-0 left-0 top-[104px] shadow-2xl" : "hidden"
          } sm:static sm:block sm:shadow-none`}
        >
          <Sidebar
            guests={guests}
            stops={stops}
            isAdmin={isAdmin}
            onAddGuest={() => setEditGuest(null)}
            onPickGuest={(g) => { setDetailGuest(g); setSidebarOpen(false); }}
            setDragGuestId={setDragGuestId}
          />
        </aside>
        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-10 sm:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            {view === "timeline" && <Timeline guests={guests} stops={stops} onPickGuest={setDetailGuest} />}
            {view === "map" && <MapView stops={stops} guests={guests} />}
            {view === "organise" && isAdmin && (
              <OrganiseBoard
                guests={guests}
                stops={stops}
                onEditStop={setEditStop}
                onAddStop={() => setEditStop(null)}
                dragGuestId={dragGuestId}
                setDragGuestId={setDragGuestId}
              />
            )}
          </div>
        </main>
      </div>

      {/* modals */}
      {editGuest !== undefined && (
        <GuestForm guest={editGuest} canDelete={isAdmin} onClose={() => setEditGuest(undefined)} />
      )}
      {editStop !== undefined && <StopForm stop={editStop} onClose={() => setEditStop(undefined)} />}
      {detailGuest && (
        <GuestDetail
          guest={detailGuest}
          stops={stops}
          canEdit={isAdmin}
          onEdit={(g) => { setDetailGuest(null); setEditGuest(g); }}
          onClose={() => setDetailGuest(null)}
        />
      )}
    </div>
  );
}
