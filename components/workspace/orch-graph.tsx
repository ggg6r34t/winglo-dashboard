"use client";

import { useRef, useState, useEffect } from "react";

interface GlyphTone { mark: string; bg: string; fg: string; name: string }

const GLYPHS: Record<string, GlyphTone> = {
  "growth":            { mark: "AT", bg: "oklch(0.32 0.05 60)",  fg: "oklch(0.95 0.04 60)",  name: "Atlas" },
  "marketing":         { mark: "OR", bg: "oklch(0.30 0.06 270)", fg: "oklch(0.93 0.04 270)", name: "Orion" },
  "social-media":      { mark: "LY", bg: "oklch(0.30 0.06 320)", fg: "oklch(0.94 0.04 320)", name: "Lyra" },
  "seo":               { mark: "VG", bg: "oklch(0.30 0.06 200)", fg: "oklch(0.93 0.04 200)", name: "Vega" },
  "research":          { mark: "SB", bg: "oklch(0.30 0.06 30)",  fg: "oklch(0.94 0.04 30)",  name: "Sable" },
  "sales":             { mark: "HL", bg: "oklch(0.30 0.06 145)", fg: "oklch(0.93 0.04 145)", name: "Hale" },
  "analytics-manager": { mark: "CA", bg: "oklch(0.30 0.06 240)", fg: "oklch(0.93 0.04 240)", name: "Cael" },
  "telehealth":        { mark: "MR", bg: "oklch(0.30 0.06 175)", fg: "oklch(0.93 0.04 175)", name: "Mira" },
};

const NODES = [
  { slug: "growth",            x: 14, y: 30 },
  { slug: "marketing",         x: 38, y: 18 },
  { slug: "social-media",      x: 62, y: 32 },
  { slug: "seo",               x: 22, y: 75 },
  { slug: "research",          x: 48, y: 62 },
  { slug: "sales",             x: 86, y: 50 },
  { slug: "analytics-manager", x: 76, y: 84 },
  { slug: "telehealth",        x: 12, y: 92 },
];

const EDGES: [string, string][] = [
  ["growth",       "marketing"],
  ["marketing",    "social-media"],
  ["growth",       "sales"],
  ["research",     "marketing"],
  ["research",     "analytics-manager"],
  ["seo",          "research"],
  ["sales",        "analytics-manager"],
  ["social-media", "research"],
];

function nodePos(slug: string, w: number, h: number) {
  const n = NODES.find(n => n.slug === slug)!;
  return { x: (n.x / 100) * w, y: (n.y / 100) * h };
}

export function OrchGraph() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 220 });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  return (
    <div style={{
      background: "var(--bg-1)",
      border: "1px solid var(--line-1)",
      borderRadius: "var(--r-lg)",
      padding: "18px 20px",
      overflow: "hidden",
    }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--fg-0)" }}>
          Orchestration
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10.5,
            color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>live collaboration graph · last 60s</span>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em",
          cursor: "pointer",
        }}>Open graph →</span>
      </div>

      {/* Canvas */}
      <div ref={canvasRef} style={{ position: "relative", height: 220, width: "100%" }}>
        <svg
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          width={w} height={h}
        >
          <defs>
            <linearGradient id="orch-edge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.35 0.01 250)" />
              <stop offset="100%" stopColor="oklch(0.55 0.04 75)" />
            </linearGradient>
          </defs>

          {/* Edges */}
          {EDGES.map(([a, b], i) => {
            const p1 = nodePos(a, w, h);
            const p2 = nodePos(b, w, h);
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2 - 18;
            const d = `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`;
            return (
              <path key={i} d={d} stroke="url(#orch-edge)" strokeWidth="1" fill="none" opacity="0.55" />
            );
          })}

          {/* Animated flow dots on first 4 edges */}
          {EDGES.slice(0, 4).map(([a, b], i) => {
            const p1 = nodePos(a, w, h);
            const p2 = nodePos(b, w, h);
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2 - 18;
            return (
              <circle key={`d${i}`} r="2" fill="oklch(0.80 0.12 75)">
                <animateMotion
                  dur={`${4 + i}s`}
                  repeatCount="indefinite"
                  path={`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`}
                  begin={`-${(i * 0.7).toFixed(1)}s`}
                />
              </circle>
            );
          })}
        </svg>

        {/* Nodes */}
        {NODES.map(n => {
          const g = GLYPHS[n.slug];
          if (!g) return null;
          return (
            <div
              key={n.slug}
              style={{
                position: "absolute",
                left: `${n.x}%`, top: `${n.y}%`,
                transform: "translate(-50%, -50%)",
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-2)",
                border: "1px solid var(--line-2)",
                padding: "6px 9px 6px 7px",
                borderRadius: 999,
                fontSize: 11,
                color: "var(--fg-0)",
                zIndex: 2,
                cursor: "pointer",
                transition: "all 160ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{
                width: 18, height: 18,
                borderRadius: 4,
                background: g.bg,
                color: g.fg,
                display: "grid", placeItems: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                fontWeight: 600,
                flexShrink: 0,
              }}>{g.mark}</span>
              <span>{g.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
