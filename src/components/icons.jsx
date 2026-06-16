import React from "react";

// Minimal line icons (Lucide-style), 24x24, stroke = currentColor.
const PATHS = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  map: <><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" /><path d="M9 3v15M15 6v15" /></>,
  bed: <><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20" /><path d="M6 8V6a2 2 0 0 1 2-2h3v4" /></>,
  key: <><circle cx="7.5" cy="15.5" r="3.5" /><path d="M10 13l9-9M16 5l3 3M14 7l3 3" /></>,
  camera: <><path d="M14.5 4l1.5 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l1.5-2z" /><circle cx="12" cy="13" r="3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  grip: <><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  external: <><path d="M15 3h6v6M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
};

export default function Icon({ name, size = 18, className = "", strokeWidth = 1.75, fill = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

// Raw SVG string for a Leaflet divIcon pin.
export function pinSvg(color) {
  return `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.82 0 0 5.82 0 13c0 9.2 13 21 13 21s13-11.8 13-21C26 5.82 20.18 0 13 0z" fill="${color}"/>
    <circle cx="13" cy="13" r="4.6" fill="#fff"/>
  </svg>`;
}
