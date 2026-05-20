// Sidebar — workspace switcher, command palette trigger, primary nav, agent directory.

const AgentGlyph = ({ agent, size }) => {
  const dim = size || 24;
  return (
    <div
      className="agent-glyph"
      style={{
        width: dim, height: dim,
        background: agent.tone.bg,
        color: agent.tone.fg,
        borderColor: "transparent",
      }}
    >
      {agent.glyph}
    </div>
  );
};

const Sidebar = ({ view, activeAgent, onSelectView, onSelectAgent }) => {
  const { AGENTS } = window.WingloData;

  const nav = [
    { id: "overview", label: "Overview", icon: "home", badge: null },
    { id: "inbox", label: "Inbox", icon: "inbox", badge: "12" },
    { id: "approvals", label: "Approvals", icon: "check", badge: "3", accent: true },
    { id: "reports", label: "Reports", icon: "report", badge: null },
    { id: "analytics", label: "Analytics", icon: "chart", badge: null },
  ];

  const ops = [
    { id: "workflows", label: "Workflows", icon: "workflow", badge: "9" },
    { id: "memory", label: "Memory", icon: "memory", badge: null },
    { id: "integrations", label: "Integrations", icon: "plug", badge: "24" },
    { id: "audit", label: "Audit log", icon: "audit", badge: null },
  ];

  return (
    <aside className="sidebar">
      <div className="workspace-switcher" onClick={() => onSelectView("overview")}>
        <div className="ws-mark">W</div>
        <div className="ws-info">
          <div className="ws-name">Winglo HQ</div>
          <div className="ws-meta">acme.co · production</div>
        </div>
        <div className="ws-chevron"><Icon name="chevronUpDown" size={13} /></div>
      </div>

      <div className="cmd-bar">
        <button className="cmd-btn">
          <Icon name="search" size={13} />
          <span>Search or run a command</span>
          <span className="kbd">⌘K</span>
        </button>
      </div>

      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        {nav.map(item => (
          <div
            key={item.id}
            className={"nav-item" + (view === item.id ? " active" : "")}
            onClick={() => onSelectView(item.id)}
          >
            <span className="nav-icon"><Icon name={item.icon} /></span>
            <span>{item.label}</span>
            {item.badge && (
              <span className={"nav-badge" + (item.accent ? " accent" : "")}>
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="nav-section" style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <div className="nav-label">
          <span>AI Employees</span>
          <span className="count">{AGENTS.length}</span>
        </div>
        {AGENTS.map(agent => (
          <div
            key={agent.id}
            className={"agent-row" + (view === "hub" && activeAgent === agent.id ? " active" : "")}
            onClick={() => onSelectAgent(agent.id)}
          >
            <AgentGlyph agent={agent} />
            <div className="agent-info">
              <div className="agent-name">{agent.name}</div>
              <div className="agent-role">{agent.role}</div>
            </div>
            <div className={"presence " + agent.status} title={agent.statusLabel}></div>
          </div>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-label">Operations</div>
        {ops.map(item => (
          <div
            key={item.id}
            className={"nav-item" + (view === item.id ? " active" : "")}
            onClick={() => onSelectView(item.id)}
          >
            <span className="nav-icon"><Icon name={item.icon} /></span>
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-avatar">JL</div>
        <div className="user-info">
          <div className="user-name">Jordan Liu</div>
          <div className="user-role">operator</div>
        </div>
        <button className="icon-btn"><Icon name="settings" /></button>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
window.AgentGlyph = AgentGlyph;
