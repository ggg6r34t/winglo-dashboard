"use client"

import { useMemo } from "react"
import { PageAgentGlyph, AGENTS_LIST } from "@/components/workspace/page-agent-glyph"

// Catmull-Rom smooth area chart
function AreaChart({ data, w = 600, h = 180 }: { data: number[]; w?: number; h?: number }) {
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const stepX = w / (data.length - 1)
  const pts = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 20) - 10] as [number, number])

  function toBez(points: [number, number][]) {
    let d = `M ${points[0][0]} ${points[0][1]}`
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[Math.max(i - 1, 0)]
      const [x1, y1] = points[i]
      const [x2, y2] = points[i + 1]
      const [x3, y3] = points[Math.min(i + 2, points.length - 1)]
      const cp1x = x1 + (x2 - x0) / 6; const cp1y = y1 + (y2 - y0) / 6
      const cp2x = x2 - (x3 - x1) / 6; const cp2y = y2 - (y3 - y1) / 6
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`
    }
    return d
  }

  const linePath = toBez(pts)
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.80 0.12 75)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="oklch(0.80 0.12 75)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1="0" x2={w} y1={(h / 4) * i + 10} y2={(h / 4) * i + 10}
          stroke="var(--line-1)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
      ))}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke="oklch(0.80 0.12 75)" strokeWidth="1.5" strokeLinecap="round" />
      {pts.map(([x, y], i) => i === pts.length - 1
        ? <circle key={i} cx={x} cy={y} r="3" fill="oklch(0.80 0.12 75)" />
        : null
      )}
    </svg>
  )
}

function BarChart({ data, h = 180 }: { data: { label: string; value: number; color: string }[]; h?: number }) {
  const max = Math.max(...data.map(d => d.value))
  const w = 600
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const bw = w / data.length - 8
        const x = i * (w / data.length) + 4
        const bh = (d.value / max) * (h - 30)
        return (
          <g key={i}>
            <rect x={x} y={h - bh - 18} width={bw} height={bh} rx="2" fill={d.color} opacity="0.85" />
            <text x={x + bw / 2} y={h - 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--fg-3)" textAnchor="middle">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

const OPS_TIMELINE = [128,142,134,156,170,168,184,192,178,196,210,224,232,218,240,256,248,268,284,272,290,312,304,318]

const DAILY_OPS = [
  { label: "M", value: 1820, color: "oklch(0.45 0.02 250)" },
  { label: "T", value: 2140, color: "oklch(0.50 0.03 250)" },
  { label: "W", value: 2304, color: "oklch(0.55 0.04 250)" },
  { label: "T", value: 1980, color: "oklch(0.50 0.03 250)" },
  { label: "F", value: 2240, color: "oklch(0.55 0.04 250)" },
  { label: "S", value: 1102, color: "oklch(0.35 0.02 250)" },
  { label: "S", value:  840, color: "oklch(0.30 0.02 250)" },
]

const DISTRIBUTION = [
  { label: "Social",     value: 28, color: "oklch(0.55 0.10 320)" },
  { label: "Growth",     value: 22, color: "oklch(0.55 0.10 60)"  },
  { label: "Sales",      value: 18, color: "oklch(0.55 0.10 145)" },
  { label: "Telehealth", value: 12, color: "oklch(0.55 0.10 175)" },
  { label: "Research",   value:  9, color: "oklch(0.55 0.10 30)"  },
  { label: "SEO",        value:  6, color: "oklch(0.55 0.10 200)" },
  { label: "Marketing",  value:  3, color: "oklch(0.55 0.10 270)" },
  { label: "Analytics",  value:  2, color: "oklch(0.55 0.10 240)" },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function heatmapColor(v: number) {
  if (v < 0.2) return "var(--bg-2)"
  if (v < 0.4) return "oklch(0.30 0.04 75)"
  if (v < 0.7) return "oklch(0.50 0.08 75)"
  return "oklch(0.72 0.12 75)"
}

export default function AnalyticsPage() {
  const leaderboard = useMemo(
    () => [...AGENTS_LIST].sort((a, b) => b.runs - a.runs).slice(0, 6),
    []
  )

  const heatmap = useMemo(() =>
    Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => {
        const business = h >= 7 && h <= 19 ? 1 : 0.2
        const weekend = d >= 5 ? 0.4 : 1
        // deterministic pseudo-random using day/hour seed
        const seed = (d * 24 + h) * 9301 + 49297
        const rnd = ((seed % 233280) / 233280)
        return Math.min(1, business * weekend * (0.5 + rnd * 0.6))
      })
    ), []
  )

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Analytics · rolling 24h</div>
          <h1 className="page-title">Workforce performance.</h1>
          <div className="page-subtitle">
            What your AI employees did, where time went, and what to watch.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn">24h</button>
          <button className="btn primary">7d</button>
          <button className="btn">30d</button>
          <button className="btn">Custom</button>
        </div>
      </div>

      <div className="kpi-strip" style={{ marginBottom: 14 }}>
        <div className="kpi">
          <div className="kpi-label">Operations · 24h</div>
          <div className="kpi-value">4,418<span className="unit">ops</span></div>
          <div className="kpi-delta up">+12.4% vs prev day</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Time saved · est.</div>
          <div className="kpi-value">312<span className="unit">hrs</span></div>
          <div className="kpi-delta">≈ 7.8 FTE equivalents</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Success rate</div>
          <div className="kpi-value">98.2<span className="unit">%</span></div>
          <div className="kpi-delta up">+0.4 pts wow</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Spend · 24h</div>
          <div className="kpi-value">$84.20<span className="unit">/day</span></div>
          <div className="kpi-delta">$1.91 per FTE-hr saved</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-head">
            <div className="chart-title-block">
              <div className="lbl">Operations · hourly</div>
              <div className="chart-value">318<span className="unit">ops · last hour</span></div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="chip active">All agents</button>
              <button className="chip">Errors only</button>
            </div>
          </div>
          <div className="chart-area">
            <AreaChart data={OPS_TIMELINE} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)" }}>
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <div className="chart-title-block">
              <div className="lbl">By agent · 7d</div>
              <div className="chart-value">leaderboard</div>
            </div>
          </div>
          {leaderboard.map((a, i) => (
            <div className="leaderboard-row" key={a.id}>
              <span className="lb-rank">{String(i + 1).padStart(2, "0")}</span>
              <PageAgentGlyph agentId={a.id} size={22} />
              <div>
                <div className="lb-name">{a.name}</div>
                <div className="lb-role">{a.role}</div>
              </div>
              <div className="lb-value">{a.runs.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="chart-card">
          <div className="chart-head">
            <div className="chart-title-block">
              <div className="lbl">Daily ops · last week</div>
              <div className="chart-value">14,426<span className="unit">total ops</span></div>
            </div>
          </div>
          <div className="chart-area">
            <BarChart data={DAILY_OPS} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <div className="chart-title-block">
              <div className="lbl">Operation distribution</div>
              <div className="chart-value">where time goes</div>
            </div>
          </div>
          <div className="dist-bar">
            {DISTRIBUTION.map(d => (
              <div key={d.label} style={{ width: `${d.value}%`, background: d.color }} title={`${d.label} · ${d.value}%`} />
            ))}
          </div>
          <div className="dist-legend">
            {DISTRIBUTION.map(d => (
              <span key={d.label}>
                <span className="swatch" style={{ background: d.color }} />
                {d.label} <span style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>{d.value}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-head">
          <div className="chart-title-block">
            <div className="lbl">Activity heatmap · 7 days × 24 hours</div>
            <div className="chart-value">when the workforce runs</div>
          </div>
          <div className="dist-legend">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="swatch" style={{ background: "var(--bg-3)" }} />quiet
              <span className="swatch" style={{ background: "oklch(0.55 0.06 75)", marginLeft: 10 }} />busy
              <span className="swatch" style={{ background: "var(--accent)", marginLeft: 4 }} />peak
            </span>
          </div>
        </div>
        {DAYS.map((label, d) => (
          <div className="heatmap-row" key={label}>
            <div className="heatmap-label">{label}</div>
            <div className="heatmap-cells">
              {heatmap[d].map((v, h) => (
                <div
                  key={h}
                  className="heatmap-cell"
                  style={{ background: heatmapColor(v) }}
                  title={`${label} ${String(h).padStart(2, "0")}:00 — ${Math.round(v * 100)}%`}
                />
              ))}
            </div>
          </div>
        ))}
        <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "60px 1fr", gap: 8 }}>
          <div />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--fg-3)" }}>
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} style={{ textAlign: "center" }}>{h % 6 === 0 ? String(h).padStart(2, "0") : ""}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
