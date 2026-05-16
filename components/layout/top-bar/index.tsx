"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function buildCrumbs(pathname: string): string[] {
  if (pathname.startsWith("/agents/")) {
    const slug = pathname.split("/")[2] ?? "";
    const names: Record<string, string> = {
      "growth":            "Atlas (Growth)",
      "social-media":      "Lyra (Social Media)",
      "seo":               "Vega (SEO)",
      "marketing":         "Orion (Marketing)",
      "sales":             "Hale (Sales)",
      "telehealth":        "Mira (Telehealth)",
      "analytics-manager": "Cael (Analytics)",
      "research":          "Sable (Research)",
      "outreach":          "Outreach",
    };
    return ["AI Employees", names[slug] ?? slug];
  }
  const labels: Record<string, string> = {
    "/workspace":              "Overview",
    "/workspace/inbox":        "Inbox",
    "/workspace/approvals":    "Approvals",
    "/workspace/reports":      "Reports",
    "/workspace/analytics":    "Analytics",
    "/workspace/workflows":    "Workflows",
    "/workspace/memory":       "Memory",
    "/workspace/integrations": "Integrations",
    "/workspace/audit":        "Audit log",
  };
  return [labels[pathname] ?? "Workspace"];
}

function IconBtn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <button
      title={title}
      style={{
        width: 28, height: 28,
        display: "grid", placeItems: "center",
        background: "transparent",
        border: "1px solid transparent",
        borderRadius: "var(--r-sm)",
        color: "var(--fg-2)",
        cursor: "pointer",
        transition: "all 120ms ease",
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = "var(--bg-2)";
        b.style.borderColor = "var(--line-1)";
        b.style.color = "var(--fg-0)";
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement;
        b.style.background = "transparent";
        b.style.borderColor = "transparent";
        b.style.color = "var(--fg-2)";
      }}
    >
      {children}
    </button>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  const crumbs = buildCrumbs(pathname);

  return (
    <header
      style={{
        height: "var(--header-h)",
        flexShrink: 0,
        borderBottom: "1px solid var(--line-1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "var(--bg-0)",
        position: "sticky",
        top: 0,
        zIndex: 5,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-1)" }}>
        <span>Winglo HQ</span>
        {crumbs.map((label, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--fg-3)" }}>/</span>
            <span style={{
              color: i === crumbs.length - 1 ? "var(--fg-0)" : "var(--fg-1)",
              fontWeight: i === crumbs.length - 1 ? 500 : 400,
            }}>{label}</span>
          </span>
        ))}
      </div>

      {/* Right: live clock + icon buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11.5,
          color: "var(--fg-2)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{
            display: "inline-block",
            width: 6, height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            animation: "winglo-pulse 2.4s ease-out infinite",
          }} />
          <span>live · {time} PT</span>
        </div>

        <IconBtn title="Layers">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3 9 5-9 5-9-5z" />
            <path d="m3 13 9 5 9-5" />
          </svg>
        </IconBtn>

        <IconBtn title="Notifications">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0v5l2 3H4l2-3z" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
        </IconBtn>
      </div>
    </header>
  );
}
