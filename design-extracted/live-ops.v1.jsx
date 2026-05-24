// live-ops.jsx — Persistent agent stage indicator.
// Anchored to the viewport (not the page), so it stays visible
// while the user navigates between Workspace → Hub → other pages.
//
// Stages: queued → working → waiting → done.
// Each op is shown as a card with a 4-node stepper communicating
// where in the lifecycle it is right now.

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
    // Active operations from overview
    D.OPERATIONS.forEach((o) => {
      ops.push({
        id: o.ref,
        agent: o.agent,
        task: o.task,
        stage: "work",
        progress: o.progress,
        eta: o.eta,
        started: secondsFromEta(o.eta),
      });
    });
    // Waiting on approval — from APPROVALS
    D.APPROVALS.forEach((a, i) => {
      ops.push({
        id: "WT-" + i,
        agent: a.agent,
        task: a.title,
        stage: "wait",
        progress: 0.66,
        eta: a.type === "publish" ? "Awaiting your approval"
            : a.type === "spend" ? "Spend > $50 · sign-off"
            : "Choose tone direction",
        started: 0,
        action: a.type === "publish" ? "Approve" : a.type === "spend" ? "Sign off" : "Choose",
      });
    });
    // Queued — a couple of upcoming workflows
    ops.push({
      id: "Q-1",
      agent: "analytics",
      task: "Weekly pipeline velocity report · W23 — auto-run Monday 06:00 PT.",
      stage: "queue",
      progress: 0,
      eta: "Scheduled Mon · 06:00",
      queuePos: 1,
    });
    ops.push({
      id: "Q-2",
      agent: "growth",
      task: "Re-engage cooled trials cohort at day 11 — 28 accounts targeted.",
      stage: "queue",
      progress: 0,
      eta: "Trigger in 2h 14m",
      queuePos: 2,
    });
    // Recently completed
    ops.push({
      id: "D-1",
      agent: "seo",
      task: "Daily SEO regression audit · 318 pages crawled, 11 issues flagged.",
      stage: "done",
      progress: 1,
      eta: "Done · 6m 24s",
      finishedAt: "2m ago",
    });
    ops.push({
      id: "D-2",
      agent: "analytics",
      task: "Pipeline velocity report — Week 22 delivered to #leadership.",
      stage: "done",
      progress: 1,
      eta: "Done · 4m 02s",
      finishedAt: "14m ago",
    });
    return ops;
  }

  function secondsFromEta(eta) {
    if (!eta) return 0;
    const m = /ETA\s+(\d+)m/.exec(eta);
    return m ? parseInt(m[1], 10) : 0;
  }

  // ─────────────────────────────────────────────────
  // 4-node stage stepper
  // ─────────────────────────────────────────────────
  function Stepper({ stage }) {
    const idx = STAGE_ORDER.indexOf(stage);
    return (
      <div className="lops-stepper">
        {STAGE_ORDER.map((s, i) => {
          const cls =
            i < idx ? "done" :
            i === idx ? `active s-${s}` :
            "";
          return (
            <div key={s} className={`lops-step ${cls}`}>
              <div className="lops-step-label">{STAGE_LABEL[s]}</div>
              <div className="lops-step-track">
                <div className="lops-step-marker"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Op card
  // ─────────────────────────────────────────────────
  function OpCard({ op, compact, onOpen }) {
    const D = window.WingloData;
    const agent = D.AGENT_BY_ID[op.agent];
    if (!agent) return null;

    const statusText = (() => {
      if (op.stage === "work")  return <><span className="num">{Math.round(op.progress * 100)}%</span><span>·</span><span>{op.eta}</span></>;
      if (op.stage === "wait")  return <><span>⏸</span><span>{op.eta}</span></>;
      if (op.stage === "queue") return <><span>↳</span><span>{op.eta}</span><span>·</span><span>queue position {op.queuePos}</span></>;
      if (op.stage === "done")  return <><span>✓</span><span>{op.eta}</span></>;
    })();

    return (
      <div className={`lops-op s-${op.stage} ${compact ? "compact" : ""}`} onClick={onOpen}>
        <div
          className="agent-glyph"
          style={{ background: agent.tone.bg, color: agent.tone.fg, borderColor: "transparent" }}
        >
          {agent.glyph}
        </div>
        <div className="lops-op-body">
          <div className="lops-op-head">
            <span className="lops-op-name">{agent.name}</span>
            <span className="lops-op-role">{agent.role}</span>
            <span className="lops-op-time">
              {op.stage === "done" ? op.finishedAt : (op.stage === "queue" ? "—" : "live")}
            </span>
          </div>
          {!compact && <div className="lops-op-task">{op.task}</div>}
          <Stepper stage={op.stage} />
          <div className="lops-op-foot">
            <span className="lops-status">{statusText}</span>
            <span className="lops-spacer"></span>
            {op.stage === "wait" && (
              <>
                <button className="lops-act" onClick={(e) => { e.stopPropagation(); }}>Review</button>
                <button className="lops-act primary" onClick={(e) => { e.stopPropagation(); }}>{op.action}</button>
              </>
            )}
            {op.stage === "work" && (
              <button className="lops-act" onClick={(e) => { e.stopPropagation(); }}>Open</button>
            )}
            {op.stage === "queue" && (
              <button className="lops-act" onClick={(e) => { e.stopPropagation(); }}>Run now</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Collapsed rail
  // ─────────────────────────────────────────────────
  function Rail({ counts, agents, onOpen }) {
    return (
      <button className="lops-rail" onClick={onOpen} aria-label="Open live operations">
        <span className="lops-rail-leader">
          <span className="heart"></span>
          <span>Live ops</span>
        </span>
        <span className="lops-counters">
          <span className="lops-counter" title="Working">
            <span className="swatch s-work"></span>
            <span className="num">{counts.work}</span>
            <span className="label">working</span>
          </span>
          <span className="lops-counter" title="Waiting">
            <span className="swatch s-wait"></span>
            <span className="num">{counts.wait}</span>
            <span className="label">waiting</span>
          </span>
          <span className="lops-counter" title="Queued">
            <span className="swatch s-queue"></span>
            <span className="num">{counts.queue}</span>
            <span className="label">queued</span>
          </span>
          <span className="lops-counter" title="Done">
            <span className="swatch s-done"></span>
            <span className="num">{counts.done}</span>
            <span className="label">done</span>
          </span>
        </span>
        <span className="lops-rail-trail">
          <span className="agents">
            {agents.slice(0, 4).map((a) => (
              <span
                key={a.id}
                className="agent-glyph"
                style={{ background: a.tone.bg, color: a.tone.fg, borderColor: "transparent" }}
              >
                {a.glyph}
              </span>
            ))}
          </span>
          <span className="chev">⌃</span>
        </span>
      </button>
    );
  }

  // ─────────────────────────────────────────────────
  // Expanded panel
  // ─────────────────────────────────────────────────
  function Panel({ ops, counts, filter, setFilter, onClose, compact, showDone, position, tweaks }) {
    const visibleOps = ops.filter((o) => {
      if (filter !== "all" && o.stage !== filter) return false;
      if (!showDone && o.stage === "done") return false;
      return true;
    });
    // Sort: work → wait → queue → done
    const order = { work: 0, wait: 1, queue: 2, done: 3 };
    visibleOps.sort((a, b) => order[a.stage] - order[b.stage]);

    return (
      <div className="lops-panel">
        <div className="lops-head">
          <div className="lops-head-l">
            <span className="lops-head-title">
              <span className="acc">●</span> Live operations
            </span>
          </div>
          <div className="lops-head-r">
            <button className="lops-iconbtn" title="Mute" onClick={(e) => e.stopPropagation()}>♪</button>
            <button className="lops-iconbtn" title="Settings" onClick={(e) => e.stopPropagation()}>⋯</button>
            <button className="lops-iconbtn" title="Minimize" onClick={onClose}>—</button>
          </div>
        </div>

        <div className="lops-legend">
          {STAGE_ORDER.map((s) => (
            <div
              key={s}
              className={`lops-legend-cell ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(filter === s ? "all" : s)}
            >
              <div className="lops-legend-top">
                <span>{STAGE_LABEL[s]}</span>
                <span className={`dot ${s}`}></span>
              </div>
              <div className="lops-legend-num">{counts[s]}</div>
            </div>
          ))}
        </div>

        <div className="lops-scroll">
          {visibleOps.length === 0 ? (
            <div className="lops-empty">
              <div className="glyph">∅</div>
              <div>no operations match this filter</div>
            </div>
          ) : (
            visibleOps.map((op) => <OpCard key={op.id} op={op} compact={compact} />)
          )}
        </div>

        <div className="lops-foot">
          <span>{counts.work + counts.wait + counts.queue} active · {counts.done} done today</span>
          <span className="link">View activity log →</span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // Root
  // ─────────────────────────────────────────────────
  const LIVE_OPS_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "position": "br",
    "compact": false,
    "showDone": true,
    "startOpen": true,
    "scanline": true
  }/*EDITMODE-END*/;

  function LiveOpsDock() {
    const useTweaksHook = window.useTweaks || ((d) => [d, () => {}]);
    const [tweaks, setTweak] = useTweaksHook(LIVE_OPS_TWEAK_DEFAULTS);
    const [open, setOpen] = React.useState(tweaks.startOpen);
    const [filter, setFilter] = React.useState("all");
    const [ops, setOps] = React.useState(() => buildOps());

    // Honor startOpen changes from tweaks live
    React.useEffect(() => { setOpen(tweaks.startOpen); }, [tweaks.startOpen]);

    // Toggle scanline animation globally
    React.useEffect(() => {
      document.documentElement.classList.toggle("lops-no-scan", !tweaks.scanline);
    }, [tweaks.scanline]);

    // Tick the progress on working ops so it feels alive
    React.useEffect(() => {
      const t = setInterval(() => {
        setOps((prev) =>
          prev.map((o) => {
            if (o.stage !== "work") return o;
            const next = Math.min(0.96, o.progress + 0.012 + Math.random() * 0.01);
            return { ...o, progress: next };
          })
        );
      }, 1800);
      return () => clearInterval(t);
    }, []);

    const counts = ops.reduce(
      (acc, o) => ({ ...acc, [o.stage]: acc[o.stage] + 1 }),
      { queue: 0, work: 0, wait: 0, done: 0 }
    );

    const agentsWorking = ops
      .filter((o) => o.stage === "work")
      .map((o) => window.WingloData.AGENT_BY_ID[o.agent])
      .filter(Boolean);

    const position = tweaks.position || "br";

    const TweaksPanel  = window.TweaksPanel;
    const TweakSection = window.TweakSection;
    const TweakRadio   = window.TweakRadio;
    const TweakToggle  = window.TweakToggle;

    return (
      <React.Fragment>
        <div className={`lops pos-${position}`}>
          {open ? (
            <Panel
              ops={ops}
              counts={counts}
              filter={filter}
              setFilter={setFilter}
              onClose={() => setOpen(false)}
              compact={!!tweaks.compact}
              showDone={tweaks.showDone !== false}
              position={position}
            />
          ) : (
            <Rail counts={counts} agents={agentsWorking} onOpen={() => setOpen(true)} />
          )}
        </div>

        {TweaksPanel && (
          <TweaksPanel>
            <TweakSection label="Live ops dock" />
            <TweakRadio
              label="Position"
              value={tweaks.position}
              options={["bl", "br", "tr"]}
              onChange={(v) => setTweak("position", v)}
            />
            <TweakToggle
              label="Compact cards"
              value={tweaks.compact}
              onChange={(v) => setTweak("compact", v)}
            />
            <TweakToggle
              label="Show completed"
              value={tweaks.showDone}
              onChange={(v) => setTweak("showDone", v)}
            />
            <TweakToggle
              label="Scanline animation"
              value={tweaks.scanline}
              onChange={(v) => setTweak("scanline", v)}
            />
            <TweakToggle
              label="Start expanded"
              value={tweaks.startOpen}
              onChange={(v) => setTweak("startOpen", v)}
            />
          </TweaksPanel>
        )}
      </React.Fragment>
    );
  }

  window.LiveOpsDock = LiveOpsDock;
})();
