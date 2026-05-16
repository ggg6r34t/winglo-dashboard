"use client";

import { Sidebar } from "./sidebar";
import { RightPanel } from "./right-panel";
import { TopBar } from "./top-bar";

export function ShellLayout({
  children,
}: {
  children: React.ReactNode;
  agentStatusSlot?: React.ReactNode; // kept for backwards compat, unused
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--sidebar-w) 1fr var(--rightpanel-w)",
        height: "100vh",
        minHeight: 600,
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <main
        style={{
          background: "var(--bg-0)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <TopBar />
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          {children}
        </div>
      </main>
      <RightPanel />
    </div>
  );
}
