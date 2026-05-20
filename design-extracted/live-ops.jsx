// live-ops.jsx — Per-agent activity cards.
// Each card is self-contained, animated according to that agent's
// current stage (queue / work / wait / done). Cards stack vertically
// in the corner of the viewport, persist across pages, and expand
// on hover for full detail.

(function () {
  const STAGE_ORDER = ["queue", "work", "wait", "done"];
  const STAGE_LABEL = {
    queue: "Queued",
    work:  "Working",
    wait:  "Waiting",
    done:  "Done",
  };

  // ─────────────────────────────────────────────────
  // Synthesize live operations from existing app data
  // ─────────────────────────────────────────────────
  function buildOps() {
    const D = window.WingloData;
    const ops = [];
    D.OPERATIONS.forEach((o) => {
      ops.push({
        id: o.ref,
        agent: o.agent,
        task: o.task,
        stage: "work",
        progress: o.progress,
        eta: o.eta,
      });
    });
    D.APPROVALS.forEach((a, i) => {
      ops.push({
        id: "WT-" + i,
        agent: a.agent,
        task: a.title,
        detail: a.detail,
        stage: "wait",
        progress: 0.66,
        eta: a.type === "publish" ? "Awaiting your approval"
            : a.type === "spend"  ? "Spend > $50 · sign-off"
            : "Choose tone direction",
        action: a.type === "publish" ? "Approve" : a.type === "spend" ? "Sign off" : "Choose",
      });
    });
    ops.push({
      id: "Q-1", agent: "analytics",
      task: "Weekly pipeline velocity report · W23",
      stage: "queue", progress: 0,
      eta: "Scheduled Mon · 06:00", queuePos: 1,
    });
    ops.push({
      id: "Q-2", agent: "growth",
      task: "Re-engage cooled trials cohort at day 11",
      stage: "queue", progress: 0,
      eta: "Trigger in 2h 14m", queuePos: 2,
    });
    ops.push({
      id: "D-1", agent: "seo",
      task: "Daily SEO regression audit · 318 pages",
      stage: "done", progress: 1,
      eta: "Done · 6m 24s", finishedAt: "2m ago",
    });
    ops.push({
      id: "D-2", agent: "analytics",
      task: "Pipeline velocity report — Week 22",
      stage: "done", progress: 1,
      eta: "Delivered to #leadership", finishedAt: "14m ago",
    });
    return ops;
  }

  // ─────────────────────────────────────────────────
  // Avatar with state-aware animated ring
  // ─────────────────────────────────────────────────
  function AgentAvatar({ agent, stage, progress }) {
    // SVG ring — circumference for a 14px radius circle
    const R = 14;
    const C = 2 * Math.PI * R;
    const dash = stage === "work" ? C * (progress || 0.05) : (stage === "wait" ? C * 0.5 : C);

    return (
      <div className={`lops2-avatar st-${stage}`}>
        <svg className="lops2-ring" viewBox="0 0 32 32" aria-hidden="true">
          <circle
            className="lops2-ring-bg"
            cx="16" cy="16" r={R}
          />
          <circle
            className="lops2-ring-fg"
            cx="16" cy="16" r={R}
            strokeDasharray={`${dash} ${C}`}
            transform="rotate(-90 16 16)"
          />
        </svg>
        <span
          className="lops2-mark"
          style={{ background: agent.tone.bg, color: agent.tone.fg }}
        >
          {agent.glyph}
        </span>
        {stage === "work" && <span className="lops2-orbit" aria-hidden="true"><span></span></span>}
        {stage === "done" && (
          <svg className="lops2-check" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.5 8.5 L7 12 L13 5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {stage === "wait" && <span className="lops2-bang" aria-hidden="true">!</span>}
        {stage === "queue" && (
          <svg className="lops2-clock" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="5" fill="none" strokeWidth="1.4" />
            <path d="M8 5 V8 L10 9.5" fill="none" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // 4-step stage stepper (shown in expanded mode)
  // ─────────────────────────────────────────────────
  function Stepper({ stage }) {
    const idx = STAGE_ORDER.indexOf(stage);
    return (
      <div className="lops2-stepper">
        {STAGE_ORDER.map((s, i) => {
          const cls = i < idx ? "done" : i === idx ? `active s-${s}` : "";
          return (
            <div key={s} className={`lops2-step ${cls}`}>
              <div className="lops2-step-label">{STAGE_LABEL[s]}</div>
              <div className="lops2-step-track">
                <div className="lops2-step-marker"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Individual agent card
  // ─────────────────────────────────────────────────
  function AgentCard({ op, onDismiss, onFocus, expanded, onHover, onLeave, onOpenAgent }) {
    const agent = window.WingloData.AGENT_BY_ID[op.agent];
    if (!agent) return null;

    const pct = Math.round((op.progress || 0) * 100);

    const stageText =
      op.stage === "work"  ? `${pct}% · ${op.eta}` :
      op.stage === "wait"  ? op.eta :
      op.stage === "queue" ? op.eta :
      op.eta;

    return (
      <div
        className={`lops2-card st-${op.stage} ${expanded ? "expanded" : ""}`}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={() => onOpenAgent && onOpenAgent(agent.id)}
      >
        {/* Stage accent stripe along the left edge */}
        <span className="lops2-stripe"></span>

        <div className="lops2-row">
          <AgentAvatar agent={agent} stage={op.stage} progress={op.progress} />

          <div className="lops2-meta">
            <div className="lops2-meta-top">
              <span className="lops2-name">{agent.name}</span>
              <span className="lops2-stage-chip">
                <span className={`lops2-stage-dot st-${op.stage}`}></span>
                {STAGE_LABEL[op.stage]}
              </span>
            </div>
            <div className="lops2-task">{op.task}</div>
          </div>

          {(op.stage === "done" || op.stage === "wait") && (
            <button
              className="lops2-x"
              onClick={(e) => { e.stopPropagation(); onDismiss && onDismiss(op.id); }}
              aria-label="Dismiss"
            >×</button>
          )}
        </div>

        {/* Live progress bar — visible in compact mode for working ops */}
        {op.stage === "work" && (
          <div className="lops2-bar">
            <div
              className="lops2-bar-fill"
              style={{ width: `${pct}%` }}
            >
              <span className="lops2-bar-shimmer"></span>
            </div>
          </div>
        )}

        {/* Expanded section */}
        <div className="lops2-expand">
          <Stepper stage={op.stage} />

          <div className="lops2-foot">
            <span className="lops2-stage-text">{stageText}</span>
            <span className="lops2-spacer"></span>
            {op.stage === "work" && (
              <>
                <button className="lops2-btn" onClick={(e) => e.stopPropagation()}>Pause</button>
                <button className="lops2-btn primary" onClick={(e) => e.stopPropagation()}>Open</button>
              </>
            )}
            {op.stage === "wait" && (
              <>
                <button className="lops2-btn" onClick={(e) => e.stopPropagation()}>Review</button>
                <button className="lops2-btn primary" onClick={(e) => e.stopPropagation()}>{op.action || "Approve"}</button>
              </>
            )}
            {op.stage === "queue" && (
              <>
                <button className="lops2-btn" onClick={(e) => e.stopPropagation()}>Reschedule</button>
                <button className="lops2-btn primary" onClick={(e) => e.stopPropagation()}>Run now</button>
              </>
            )}
            {op.stage === "done" && (
              <>
                <button className="lops2-btn" onClick={(e) => e.stopPropagation()}>Archive</button>
                <button className="lops2-btn primary" onClick={(e) => e.stopPropagation()}>View report</button>
              </>
            )}
          </div>

          {op.detail && <div className="lops2-detail">{op.detail}</div>}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Collapsed header — agent dots, click to expand stack
  // ─────────────────────────────────────────────────
  function Header({ ops, collapsed, onToggle }) {
    const counts = ops.reduce(
      (a, o) => ({ ...a, [o.stage]: a[o.stage] + 1 }),
      { queue: 0, work: 0, wait: 0, done: 0 }
    );
    return (
      <button className="lops2-header" onClick={onToggle}>
        <span className="lops2-header-pulse" aria-hidden="true"></span>
        <span className="lops2-header-title">
          <span className="lops2-header-num">{counts.work + counts.wait + counts.queue}</span>
          <span> agents active</span>
        </span>
        <span className="lops2-header-dots">
          <span className={`lops2-mini-dot s-work`}  title={`${counts.work} working`}>{counts.work}</span>
          <span className={`lops2-mini-dot s-wait`}  title={`${counts.wait} waiting`}>{counts.wait}</span>
          <span className={`lops2-mini-dot s-queue`} title={`${counts.queue} queued`}>{counts.queue}</span>
          <span className={`lops2-mini-dot s-done`}  title={`${counts.done} done`}>{counts.done}</span>
        </span>
        <span className="lops2-header-chev">{collapsed ? "▴" : "▾"}</span>
      </button>
    );
  }

  // ─────────────────────────────────────────────────
  // Root
  // ─────────────────────────────────────────────────
  const LIVE_OPS_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "position": "br",
    "ringStyle": "progress",
    "showDone": true,
    "alwaysExpanded": false,
    "breathe": true,
    "stackLimit": 5
  }/*EDITMODE-END*/;

  function LiveOpsDock() {
    const useTweaksHook = window.useTweaks || ((d) => [d, () => {}]);
    const [tweaks, setTweak] = useTweaksHook(LIVE_OPS_TWEAK_DEFAULTS);
    const [ops, setOps] = React.useState(() => buildOps());
    const [hoveredId, setHoveredId] = React.useState(null);
    const [collapsed, setCollapsed] = React.useState(false);

    // Toggle global classes for tweaks
    React.useEffect(() => {
      document.documentElement.classList.toggle("lops2-no-breathe", !tweaks.breathe);
      document.documentElement.classList.toggle(`lops2-ring-${tweaks.ringStyle}`, true);
    }, [tweaks.breathe, tweaks.ringStyle]);

    // Tick progress on working ops
    React.useEffect(() => {
      const t = setInterval(() => {
        setOps((prev) =>
          prev.map((o) => {
            if (o.stage !== "work") return o;
            const next = Math.min(0.97, o.progress + 0.008 + Math.random() * 0.01);
            return { ...o, progress: next };
          })
        );
      }, 1600);
      return () => clearInterval(t);
    }, []);

    // Simulated lifecycle: occasionally transition states for liveliness
    React.useEffect(() => {
      const t = setInterval(() => {
        setOps((prev) => {
          // Pick a random working op and bump it to "wait" briefly
          const workOps = prev.filter((o) => o.stage === "work" && o.progress > 0.85);
          if (workOps.length === 0) return prev;
          const pick = workOps[Math.floor(Math.random() * workOps.length)];
          return prev.map((o) => {
            if (o.id !== pick.id) return o;
            // Loop back to start
            return { ...o, progress: 0.08, stage: "work" };
          });
        });
      }, 24000);
      return () => clearInterval(t);
    }, []);

    const onDismiss = (id) => setOps((prev) => prev.filter((o) => o.id !== id));
    const onOpenAgent = (id) => {
      window.dispatchEvent(new CustomEvent("winglo-open-agent", { detail: id }));
    };

    const visible = ops
      .filter((o) => tweaks.showDone || o.stage !== "done")
      .sort((a, b) => {
        const order = { wait: 0, work: 1, queue: 2, done: 3 };
        return order[a.stage] - order[b.stage];
      });

    const limit = tweaks.stackLimit || 5;
    const shown = collapsed ? [] : visible.slice(0, limit);
    const overflow = visible.length - shown.length;

    const TweaksPanel  = window.TweaksPanel;
    const TweakSection = window.TweakSection;
    const TweakRadio   = window.TweakRadio;
    const TweakToggle  = window.TweakToggle;
    const TweakSlider  = window.TweakSlider;

    const position = tweaks.position || "br";

    return (
      <React.Fragment>
        <div className={`lops2 pos-${position}`}>
          <Header ops={visible} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

          <div className="lops2-stack">
            {shown.map((op, i) => (
              <div
                key={op.id}
                className="lops2-slot"
                style={{ "--i": i, animationDelay: `${i * 40}ms` }}
              >
                <AgentCard
                  op={op}
                  expanded={tweaks.alwaysExpanded || hoveredId === op.id}
                  onHover={() => setHoveredId(op.id)}
                  onLeave={() => setHoveredId(null)}
                  onDismiss={onDismiss}
                  onOpenAgent={onOpenAgent}
                />
              </div>
            ))}
            {overflow > 0 && !collapsed && (
              <button className="lops2-more">+{overflow} more · view all</button>
            )}
          </div>
        </div>

        {TweaksPanel && (
          <TweaksPanel>
            <TweakSection label="Per-agent dock" />
            <TweakRadio
              label="Position"
              value={tweaks.position}
              options={["bl", "br"]}
              onChange={(v) => setTweak("position", v)}
            />
            <TweakRadio
              label="Avatar ring"
              value={tweaks.ringStyle}
              options={["progress", "pulse", "none"]}
              onChange={(v) => setTweak("ringStyle", v)}
            />
            <TweakToggle
              label="Always expanded"
              value={tweaks.alwaysExpanded}
              onChange={(v) => setTweak("alwaysExpanded", v)}
            />
            <TweakToggle
              label="Show completed"
              value={tweaks.showDone}
              onChange={(v) => setTweak("showDone", v)}
            />
            <TweakToggle
              label="Subtle breathing"
              value={tweaks.breathe}
              onChange={(v) => setTweak("breathe", v)}
            />
            <TweakSlider
              label="Stack limit"
              value={tweaks.stackLimit}
              min={2} max={10} step={1}
              onChange={(v) => setTweak("stackLimit", v)}
            />
          </TweaksPanel>
        )}
      </React.Fragment>
    );
  }

  window.LiveOpsDock = LiveOpsDock;
})();
