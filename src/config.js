// ----------------------------------------------------------------------------
// Things Kevin can tweak without touching the rest of the code.
// ----------------------------------------------------------------------------

export const APP = {
  title: "Our Ireland Trip",
  subtitle: "Who's here when, where you're sleeping, and when you need to book your own place.",
  weddingDate: "2026-10-03",

  // The overall window the planner shows (two weeks either side of the wedding).
  rangeStart: "2026-09-19",
  rangeEnd: "2026-10-18",

  // Soft gate for the "organise" controls — same idea as the guestplanner site.
  // Anyone can VIEW everything; this just unlocks adding/editing stops & assigning people.
  // Change this to whatever you like.
  adminPassword: "claddagh",
};

// Where everything lives in your existing Firebase Realtime Database.
// Isolated under its own top-level key so it never touches the wedding-seating data.
export const DB_ROOT = "irishWeddingPlanner";

export const firebaseConfig = {
  apiKey: "AIzaSyBkIds_jYuLBCwchu93xngykYg_0W96zO0",
  authDomain: "guest-accommodation.firebaseapp.com",
  databaseURL: "https://guest-accommodation-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "guest-accommodation",
  storageBucket: "guest-accommodation.firebasestorage.app",
  messagingSenderId: "35728020050",
  appId: "1:35728020050:web:4d3cc8f5aaab19d751858b",
};

// Stop types and how they read on screen.
export const STOP_TYPES = {
  covered: {
    label: "Sorted for you",
    short: "Covered",
    icon: "bed",
    color: "#059669", // emerald-600
    blurb: "We've got beds for you here — nothing to book.",
  },
  "book-your-own": {
    label: "Book your own",
    short: "Book your own",
    icon: "key",
    color: "#d97706", // amber-600
    blurb: "This is the plan for this leg, but you'll need to book your own place.",
  },
  activity: {
    label: "Thing to do",
    short: "To do",
    icon: "camera",
    color: "#8b5cf6", // violet-500
    blurb: "A recommendation, not accommodation.",
  },
};

export const COVERAGE = {
  covered: { label: "Sorted", color: "#059669", bg: "#ecfdf5", text: "#047857" },
  "book-your-own": { label: "Book your own", color: "#d97706", bg: "#fffbeb", text: "#b45309" },
  gap: { label: "Nothing planned", color: "#e11d48", bg: "#fff1f2", text: "#be123c" },
};
