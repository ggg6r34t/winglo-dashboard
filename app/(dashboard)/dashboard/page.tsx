import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { RecentRunsList } from "@/features/dashboard/components/recent-runs-list";
import { getOpportunities } from "@/server/dal/opportunities";
import { getAIRuns, getActiveAIRuns } from "@/server/dal/ai-runs";
import { MOCK_ORG_ID } from "@/lib/mock";

async function loadData() {
  const [opportunities, recentRuns, activeRuns] = await Promise.all([
    getOpportunities(MOCK_ORG_ID, { limit: 100 }),
    getAIRuns(MOCK_ORG_ID, { limit: 8 }),
    getActiveAIRuns(MOCK_ORG_ID),
  ]);
  return { opportunities, recentRuns, activeRuns };
}

export default async function DashboardPage() {
  let data: Awaited<ReturnType<typeof loadData>> | null = null;
  try {
    data = await loadData();
  } catch {
    return (
      <div className="p-4 text-sm" style={{ color: "var(--text-muted)" }}>
        Failed to load dashboard data. Please try refreshing.
      </div>
    );
  }

  const { opportunities, recentRuns, activeRuns } = data;
  const totalDiscovered = opportunities.length;
  const totalApproved = opportunities.filter((o) => o.status === "approved").length;
  const totalContacted = opportunities.filter((o) => o.status === "contacted").length;
  const activeAgentCount = activeRuns.length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Growth operations command center"
      />

      {/* Row 1: 4 metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Discovered"
          value={totalDiscovered}
          sub="last 100 opportunities"
        />
        <MetricCard
          label="Approved"
          value={totalApproved}
          sub="ready for outreach"
        />
        <MetricCard
          label="Contacted"
          value={totalContacted}
          sub="outreach sent"
        />
        <MetricCard
          label="Active Agents"
          value={activeAgentCount}
          sub="running now"
        />
      </div>

      {/* Row 2: activity feed + recent runs */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ActivityFeed runs={recentRuns} />
        </div>
        <div>
          <RecentRunsList runs={recentRuns.slice(0, 5)} />
        </div>
      </div>
    </>
  );
}
