"use client";

import { motion } from "framer-motion";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

export function ShellLayout({
  children,
  agentStatusSlot,
}: {
  children: React.ReactNode;
  agentStatusSlot?: React.ReactNode;
}) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar agentStatusSlot={agentStatusSlot} />
      <Sidebar />
      <motion.main
        layout
        animate={{ marginLeft: collapsed ? 52 : 220 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="pt-[52px] min-h-screen"
      >
        <div className="max-w-[1280px] mx-auto px-6 py-6">{children}</div>
      </motion.main>
    </div>
  );
}
