import React, { useEffect, useState } from "react";
import { APP } from "./config.js";
import { subscribeGuests, subscribeStops, subscribeItinerary, subscribeRoutes } from "./firebase.js";
import { toDay, todayIso, fmt } from "./lib/dates.js";
import Sidebar from "./components/Sidebar.jsx";
import Timeline from "./components/Timeline.jsx";
import MapView from "./components/MapView.jsx";
import OrganiseBoard from "./components/OrganiseBoard.jsx";
import GuestForm from "./components/GuestForm.jsx";
import StopForm from "./components/StopForm.jsx";
import ItineraryForm from "./components/ItineraryForm.jsx";
import RouteForm from "./components/RouteForm.jsx";
import GuestDetail from "./components/GuestDetail.jsx";
import Icon from "./components/icons.jsx";

const VIEWS = [
  { key: "timeline", label: "Timeline", icon: "calendar" },
  { key: "map", label: "Map", icon: "map" },
  { key: "organise", label: "Organise", icon: "bed" },
];

function Countdown() {
  const days = toDay(APP.weddingDate) - toDay(todayIso());
  const text =
    days > 1 ? `${days} days to go` :
    days === 1 ? "Tomorrow" :
    days === 0 ? "Today" :
    `${-days} days married`;
  return (
    <div className="text-right leading-tight shrink-0">
      <div className="text-sm font-medium text-emerald-900">{fmt(APP.weddingDate, { weekday: "long", day: "numeric", month: "long" })}</div>
      <div className="text-xs text-stone-500">{text}</div>
    </div>
  );
}

export default function App() {
  const [guests, setGuests] = useState([]);
  const [stops, setStops] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [view, setView] = useState("timeline");
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("iwp_admin") === "1");
  const [editGuest, setEditGuest] = useState(undefined);
  const [detailGuest, setDetailGuest] = useState(null);
  const [editStop, setEditStop] = useState(undefined);
  const [editItinerary, setEditItinerary] = useState(undefined);
  const [editRoute, setEditRoute] = useState(undefined);
  const [dragGuestId, setDragGuestId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u1 = subscribeGuests(setGuests);
    const u2 = subscribeStops(setStops);
    const u3 = subscribeItinerary(setItinerary);
    const u4 = subscribeRoutes(setRoutes);
    return () => { u1(); u2(); u3(); u4(); };
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

  const views = VIEWS.filter((v) => v.key !== "organise" || isAdmin);

  return (
    <div className="h-screen flex flex-col bg-[#fbfbfa]">
      {/* top bar */}
      <header className="bg-white border-b border-stone-200 shrink-0">
        <div className="px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <button className="sm:hidden text-stone-500 -ml-1 p-1" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle travellers menu">
            <Icon name="menu" size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl sm:text-[1.6rem] text-emerald-950 leading-none tracking-tight truncate">{APP.title}</h1>
            <p className="text-xs text-stone-500 hidden sm:block truncate mt-1">{APP.subtitle}</p>
          </div>
          <Countdown />
        </div>
        <div className="px-3 sm:px-6 flex items-center gap-1">
          {views.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                view === v.key
                  ? "border-emerald-600 text-emerald-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon name={v.icon} size={16} />
              {v.label}
            </button>
          ))}
          <button
            onClick={toggleAdmin}
            className={`ml-auto text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              isAdmin ? "text-emerald-700 hover:bg-emerald-50" : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            }`}
            title={isAdmin ? "You're in organiser mode" : "Unlock organiser controls"}
          >
            {isAdmin ? "Organiser ·  on" : "Organiser"}
          </button>
        </div>
      </header>

      {/* body */}
      <div className="flex-1 flex min-h-0">
        <aside
          className={`bg-white border-r border-stone-200 w-72 shrink-0 z-20 ${
            sidebarOpen ? "fixed inset-y-0 left-0 top-[108px] shadow-2xl" : "hidden"
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

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-7">
          <div className="max-w-5xl mx-auto">
            {view === "timeline" && <Timeline guests={guests} stops={stops} itinerary={itinerary} onPickGuest={setDetailGuest} />}
            {view === "map" && <MapView stops={stops} guests={guests} routes={routes} />}
            {view === "organise" && isAdmin && (
              <OrganiseBoard
                guests={guests}
                stops={stops}
                itinerary={itinerary}
                routes={routes}
                onEditStop={setEditStop}
                onAddStop={() => setEditStop(null)}
                onEditItinerary={setEditItinerary}
                onAddItinerary={() => setEditItinerary(null)}
                onEditRoute={setEditRoute}
                onAddRoute={() => setEditRoute(null)}
                dragGuestId={dragGuestId}
                setDragGuestId={setDragGuestId}
              />
            )}
          </div>
        </main>
      </div>

      {editGuest !== undefined && (
        <GuestForm guest={editGuest} canDelete={isAdmin} onClose={() => setEditGuest(undefined)} />
      )}
      {editStop !== undefined && <StopForm stop={editStop} onClose={() => setEditStop(undefined)} />}
      {editItinerary !== undefined && <ItineraryForm item={editItinerary} onClose={() => setEditItinerary(undefined)} />}
      {editRoute !== undefined && <RouteForm route={editRoute} stops={stops} onClose={() => setEditRoute(undefined)} />}
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
