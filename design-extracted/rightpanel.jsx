// Right context panel — activity feed, approvals, memory.

const RightPanel = ({ onOpenAgent }) => {
  const { ACTIVITY, APPROVALS, MEMORY, AGENT_BY_ID } = window.WingloData;
  const [tab, setTab] = React.useState("activity");

  return (
    <aside className="rightpanel">
      <div className="rp-header">
        <div className="rp-tabs">
          <div className={"rp-tab" + (tab === "activity" ? " active" : "")} onClick={() => setTab("activity")}>
            Activity <span className="count">{ACTIVITY.length}</span>
          </div>
          <div className={"rp-tab" + (tab === "approvals" ? " active" : "")} onClick={() => setTab("approvals")}>
            Approvals <span className="count">{APPROVALS.length}</span>
          </div>
          <div className={"rp-tab" + (tab === "memory" ? " active" : "")} onClick={() => setTab("memory")}>
            Memory <span className="count">{MEMORY.length}</span>
          </div>
        </div>
        <button className="icon-btn" style={{ marginLeft: "auto" }}><Icon name="bell" /></button>
      </div>

      <div className="rp-scroll">
        {tab === "activity" && (
          <>
            <div className="rp-section">
              <div className="rp-section-title">
                <span>Live stream</span>
                <span className="workspace-clock"><span className="pulse"></span>streaming</span>
              </div>
              {ACTIVITY.map((a, i) => {
                const agent = AGENT_BY_ID[a.agent];
                return (
                  <div className="activity-item" key={i}>
                    <div
                      className="activity-glyph"
                      style={{ background: agent.tone.bg, color: agent.tone.fg, borderColor: "transparent" }}
                    >
                      {agent.glyph}
                    </div>
                    <div className="activity-body">
                      <div className="activity-line">
                        <span className="who">{agent.name}</span>{" "}
                        <span className="verb">{a.verb}</span>{" "}
                        <span className="target">{a.target}</span>
                        <span style={{ color: "var(--fg-3)" }}> — {a.detail}</span>
                      </div>
                      <div className="activity-meta">
                        <span>{a.time}</span>
                        <span>·</span>
                        <span>{a.ref}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "approvals" && (
          <div className="rp-section">
            <div className="rp-section-title">
              <span>Awaiting your decision</span>
              <span style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>{APPROVALS.length}</span>
            </div>
            {APPROVALS.map((a, i) => {
              const agent = AGENT_BY_ID[a.agent];
              return (
                <div className="approval" key={i}>
                  <div className="approval-head">
                    <div className="approval-from">
                      <AgentGlyph agent={agent} size={16} />
                      <span>{agent.name}</span>
                    </div>
                    <span className="approval-type">{a.type}</span>
                  </div>
                  <div className="approval-title">{a.title}</div>
                  <div className="approval-detail">{a.detail}</div>
                  <div className="approval-actions">
                    <button className="btn-mini">Decline</button>
                    <button className="btn-mini">Discuss</button>
                    <button className="btn-mini approve">Approve</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "memory" && (
          <div className="rp-section">
            <div className="rp-section-title">
              <span>Recent mutations</span>
              <span style={{ color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>last 6h</span>
            </div>
            {MEMORY.map((m, i) => (
              <div key={i} className="memory-item">
                <div className="memory-key">{m.key}</div>
                <div className="memory-val">{m.val}</div>
                <div className="memory-meta">{m.by} · {m.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

window.RightPanel = RightPanel;
