// App — top-level layout state.

const App = () => {
  const [view, setView] = React.useState("overview");
  const [activeAgent, setActiveAgent] = React.useState(null);

  const onSelectView = (v) => {
    setView(v);
    setActiveAgent(null);
  };
  const onSelectAgent = (id) => {
    setView("hub");
    setActiveAgent(id);
  };
  const onBack = () => {
    setView("overview");
    setActiveAgent(null);
  };

  // Clock for header
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const agent = activeAgent && window.WingloData.AGENT_BY_ID[activeAgent];

  return (
    <div className="app">
      <Sidebar
        view={view}
        activeAgent={activeAgent}
        onSelectView={onSelectView}
        onSelectAgent={onSelectAgent}
      />

      <main className="main" data-screen-label={view === "hub" ? `Hub — ${agent?.name}` : `Workspace — ${view}`}>
        <div className="topbar">
          <div className="topbar-left">
            <div className="crumbs">
              <span>Winglo HQ</span>
              <span className="sep">/</span>
              {view === "hub" && agent ? (
                <>
                  <span>AI Employees</span>
                  <span className="sep">/</span>
                  <span className="here">{agent.name}</span>
                </>
              ) : (
                <span className="here" style={{ textTransform: "capitalize" }}>{view}</span>
              )}
            </div>
          </div>
          <div className="topbar-right">
            <div className="workspace-clock">
              <span className="pulse"></span>
              <span>live · {time} PT</span>
            </div>
            <button className="icon-btn"><Icon name="layers" /></button>
            <button className="icon-btn"><Icon name="bell" /></button>
          </div>
        </div>

        <div className="main-scroll">
          {view === "hub" && activeAgent && <AgentHub agentId={activeAgent} onBack={onBack} />}
          {view === "overview" && <Overview onOpenAgent={onSelectAgent} />}
          {view === "inbox" && <InboxPage />}
          {view === "approvals" && <ApprovalsPage />}
          {view === "reports" && <ReportsPage />}
          {view === "analytics" && <AnalyticsPage />}
          {view === "workflows" && <WorkflowsPage />}
          {view === "memory" && <MemoryPage />}
          {view === "integrations" && <IntegrationsPage />}
          {view === "audit" && <AuditPage />}
        </div>
      </main>

      <RightPanel onOpenAgent={onSelectAgent} />

      {window.LiveOpsDock && <window.LiveOpsDock />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
