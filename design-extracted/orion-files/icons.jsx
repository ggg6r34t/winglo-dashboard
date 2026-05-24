// Lightweight stroke icons — uniform 14px, 1.5 stroke, currentColor.
// Hand-drawn paths kept minimal to fit the operational/editorial tone.

const Icon = ({ name, size = 14 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /></>,
    inbox: <><path d="M3 13h5l2 3h4l2-3h5" /><path d="M3 13l3-8h12l3 8v7H3z" /></>,
    check: <><path d="M5 12l4 4 10-10" /></>,
    report: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /><path d="M10 13h6" /><path d="M10 17h4" /></>,
    chart: <><path d="M4 20V8" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
    workflow: <><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><path d="M8 6h8" /><path d="M7 8l4 8" /><path d="M17 8l-4 8" /></>,
    memory: <><path d="M4 7c0-2 2-3 4-3s4 1 4 3v10c0 2-2 3-4 3s-4-1-4-3" /><path d="M12 7c0-2 2-3 4-3s4 1 4 3v10c0 2-2 3-4 3s-4-1-4-3" /><path d="M4 11h16" /><path d="M4 14h16" /></>,
    plug: <><path d="M8 2v4" /><path d="M16 2v4" /><path d="M5 6h14v6a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z" /><path d="M12 17v5" /></>,
    audit: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
    chevron: <><path d="m9 6 6 6-6 6" /></>,
    chevronUpDown: <><path d="m8 9 4-4 4 4" /><path d="m16 15-4 4-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    sparkles: <><path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z" /><path d="M19 4l.7 2L22 7l-2.3.8L19 10l-.7-2.2L16 7l2.3-1z" /></>,
    cmd: <><path d="M8 8h8v8H8z" /><path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4" /><path d="M16 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4" /><path d="M8 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4" /><path d="M16 16a2 2 0 1 1 0 4 2 2 0 0 1 0-4" /></>,
    filter: <><path d="M3 5h18l-7 8v6l-4-2v-4z" /></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
};

window.Icon = Icon;
