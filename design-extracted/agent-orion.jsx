// Orion — Marketing Manager — conversational hub.
// Overrides the standard tab layout for agent.id === "marketing".

// Orion's sub-surfaces
const ORION_NAV = [
  { section: "Studio", items: [
    { id: "home",       label: "Home",            icon: "home" },
    { id: "brief",      label: "Weekly brief",    icon: "report",   badge: "New",  badgeKind: "accent" },
    { id: "approvals",  label: "Approve content", icon: "check",    badge: "3",    badgeKind: "count" },
    { id: "tasks",      label: "Tasks",           icon: "workflow", badge: "5",    badgeKind: "count" },
    { id: "design",     label: "Design briefs",   icon: "layers",   badge: "7",    badgeKind: "count" },
    { id: "email",      label: "Email draft",     icon: "inbox",    badge: "1",    badgeKind: "count" },
    { id: "publishing", label: "Publishing",      icon: "calendar" },
    { id: "campaign",   label: "Campaigns",       icon: "sparkles" },
  ]},
  { section: "Intelligence", items: [
    { id: "analytics",  label: "Channel analytics", icon: "chart" },
    { id: "audience",   label: "Audience audit",    icon: "audit" },
    { id: "brand",      label: "Brand consistency", icon: "filter" },
    { id: "competitors",label: "Competitor watch",  icon: "search" },
  ]},
  { section: "Workspace", items: [
    { id: "connectors", label: "Connectors", icon: "plug" },
    { id: "memory",     label: "Memory",     icon: "memory" },
    { id: "settings",   label: "Settings",   icon: "settings" },
  ]},
];

// Compact "Ask Orion" button — drop into any sub-page head's right side.
const AskOrionButton = ({ agent }) => (
  <button className="ask-orion-btn ghost" title={`Ask ${agent.name} a question`}>
    <span className="glyph" style={{ background: agent.tone.bg, color: agent.tone.fg }}>{agent.glyph}</span>
    Ask Orion
  </button>
);

const OrionMark = ({ agent, state = "idle", size = "" }) => (
  <div
    className={"orion-mark " + state + " " + size}
    style={{ background: agent.tone.bg, color: agent.tone.fg }}
  >
    {agent.glyph}
    <span className="orion-presence" />
  </div>
);

const OrionSideNav = ({ active, onPick }) => (
  <aside className="orion-sidenav">
    {ORION_NAV.map(sec => (
      <div className="orion-sidenav-section" key={sec.section}>
        {sec.section !== "Studio" && <div className="orion-sidenav-label">{sec.section}</div>}
        {sec.section === "Studio" && sec.items.slice(0, 1).map(it => (
          <div
            key={it.id}
            className={"orion-sidenav-item" + (active === it.id ? " active" : "")}
            onClick={() => onPick(it.id)}
          >
            <span className="sn-icon"><Icon name={it.icon} size={15} /></span>
            <span>{it.label}</span>
            {it.badge && <span className={"sn-badge " + (it.badgeKind || "")}>{it.badge}</span>}
          </div>
        ))}
        {sec.section === "Studio" && (
          <>
            <div className="orion-sidenav-label">Marketing</div>
            {sec.items.slice(1).map(it => (
              <div
                key={it.id}
                className={"orion-sidenav-item" + (active === it.id ? " active" : "")}
                onClick={() => onPick(it.id)}
              >
                <span className="sn-icon"><Icon name={it.icon} size={15} /></span>
                <span>{it.label}</span>
                {it.badge && <span className={"sn-badge " + (it.badgeKind || "")}>{it.badge}</span>}
              </div>
            ))}
          </>
        )}
        {sec.section !== "Studio" && sec.items.map(it => (
          <div
            key={it.id}
            className={"orion-sidenav-item" + (active === it.id ? " active" : "")}
            onClick={() => onPick(it.id)}
          >
            <span className="sn-icon"><Icon name={it.icon} size={15} /></span>
            <span>{it.label}</span>
            {it.badge && <span className={"sn-badge " + (it.badgeKind || "")}>{it.badge}</span>}
          </div>
        ))}
      </div>
    ))}
  </aside>
);

// ----------- Sub-page renderers -----------

const PROMPT_QUESTION = "What do you want to push this week?";

// ----- Orion's openers -----
// A pool of questions/suggestions Orion can lead with. Selection is context-aware
// (time of day, day of week) and never repeats the previous one. The canonical
// "What do you want to push this week?" is reserved for first-ever visit.
const ORION_OPENERS = [
  // Canonical first-visit opener
  {
    id: "push-week",
    text: "What do you want to push this week?",
    chips: [
      { short: "Brief me",    full: "Give me a quick brief on what matters this week." },
      { short: "Draft",       full: "Draft a campaign you think we should run." },
      { short: "Show status", full: "What's the status of everything you're working on right now?" },
    ],
    when: ["any"],
  },

  // Direct, focused questions
  {
    id: "focus-today",
    text: "Where should I focus today?",
    chips: [
      { short: "The launch",   full: "Focus on the Q3 launch — make sure everything's ready for Thursday." },
      { short: "Partnerships", full: "Focus on partnerships and the Coil announcement." },
      { short: "You decide",   full: "You decide — pick what's most important right now." },
    ],
    when: ["morning"],
  },
  {
    id: "priority-q",
    text: "What's the priority right now — Q3 launch, partnerships, or pipeline?",
    chips: [
      { short: "Launch",       full: "Q3 launch is the priority. Drop everything else." },
      { short: "Partnerships", full: "Partnerships — close Coil first." },
      { short: "Pipeline",     full: "Pipeline — focus on the stage-4 stalls." },
    ],
    when: ["any"],
  },
  {
    id: "how-help",
    text: "How can I help you today?",
    chips: [
      { short: "Catch me up", full: "Catch me up on the last 24 hours." },
      { short: "Show drafts", full: "Show me everything that's waiting on my approval." },
      { short: "Just chat",   full: "Let's talk strategy — what's on your mind?" },
    ],
    when: ["any"],
  },

  // Proactive suggestions — "I noticed / heads up"
  {
    id: "noticed-hook",
    text: "I noticed the launch blog could use a stronger hook in section 2. Want me to revise?",
    chips: [
      { short: "Revise it", full: "Yes — revise the launch blog hook in section 2." },
      { short: "Show me",   full: "Show me what you'd change before I decide." },
      { short: "Leave it",  full: "Leave the hook alone — let's ship as-is." },
    ],
    when: ["any"],
  },
  {
    id: "noticed-coil",
    text: "Quick thought — Coil's investor brief mentioned a feature we don't have positioning for. Want me to dig in?",
    chips: [
      { short: "Dig in",        full: "Yes — dig in and bring me what you find." },
      { short: "Loop in Sable", full: "Loop in @Sable to research that angle properly." },
      { short: "Not now",       full: "Not now — let's focus on the launch first." },
    ],
    when: ["any"],
  },
  {
    id: "heads-up-lyra",
    text: "Heads up — Lyra finished the reel variants. Want to preview before I queue them?",
    chips: [
      { short: "Preview",      full: "Yes — show me the reel variants before queuing." },
      { short: "Queue them",   full: "Trust Lyra's pick. Queue them." },
      { short: "Loop me later", full: "Queue them but loop me in if anything underperforms." },
    ],
    when: ["any"],
  },
  {
    id: "heads-up-pr",
    text: "The Coil PR draft is ready. Want to read it first, or should I send to legal?",
    chips: [
      { short: "Send to legal",   full: "Send it straight to legal — I trust the draft." },
      { short: "Read it first",   full: "I'll read it first. Pull it up." },
      { short: "Walk me through", full: "Walk me through the key paragraphs." },
    ],
    when: ["any"],
  },

  // Status check-ins
  {
    id: "status-am",
    text: "Want a quick brief on what's moved since this morning?",
    chips: [
      { short: "Quick brief", full: "Give me the quick version — top three things." },
      { short: "Full update", full: "Full update — walk me through everything." },
      { short: "I'm good",    full: "I'm good — I'll check the dashboard myself." },
    ],
    when: ["afternoon", "evening"],
  },
  {
    id: "decision-launch",
    text: "Quick check — am I clear to hold the Q3 launch for Thursday 09:00, or do you want to shift?",
    chips: [
      { short: "Hold it",    full: "Hold the launch for Thursday 09:00 PT as planned." },
      { short: "Push it",    full: "Push the launch to Friday — we need more time." },
      { short: "Talk angle", full: "Let's talk about the launch angle before we commit." },
    ],
    when: ["any"],
  },

  // Time-specific
  {
    id: "wrap-eve",
    text: "Before you sign off — anything you want me to set up for tomorrow?",
    chips: [
      { short: "Plan tomorrow", full: "Plan tomorrow — schedule everything you have queued." },
      { short: "Hold the line", full: "Just hold the line — I'll check in tomorrow morning." },
      { short: "One more thing", full: "One more thing before I go — let me think." },
    ],
    when: ["evening"],
  },
  {
    id: "fri-review",
    text: "It's been a busy week. Want to look at what worked and what didn't?",
    chips: [
      { short: "Show me",   full: "Show me what worked and what didn't this week." },
      { short: "Just wins", full: "Just the wins — what did we ship that's working?" },
      { short: "Next week", full: "Skip the review — let's plan next week instead." },
    ],
    when: ["fri"],
  },

  // Strategic / conversational
  {
    id: "experiment",
    text: "Sable's pricing data is hot. Want to run that experiment we discussed?",
    chips: [
      { short: "Let's run it",   full: "Let's run the pricing experiment. What do you need from me?" },
      { short: "Brief me first", full: "Brief me on Sable's findings before we commit." },
      { short: "Not yet",        full: "Hold the pricing experiment — Q3 launch first." },
    ],
    when: ["any"],
  },
];

// Pick an opener intelligently — favors time-of-day fit, avoids repetition,
// reserves the canonical "push-week" opener for first-ever visit.
function pickOrionOpener() {
  let hasVisited = false;
  let lastId = null;
  try {
    hasVisited = localStorage.getItem("orion.hasVisited") === "1";
    lastId = localStorage.getItem("orion.lastOpener");
  } catch {}

  if (!hasVisited) {
    try {
      localStorage.setItem("orion.hasVisited", "1");
      localStorage.setItem("orion.lastOpener", "push-week");
    } catch {}
    return ORION_OPENERS.find(o => o.id === "push-week");
  }

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const timeTag = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dayTag  = day === 5 ? "fri" : null;

  // Skip the canonical "push-week" on return visits — it's reserved for first time.
  let pool = ORION_OPENERS.filter(o => o.id !== "push-week");
  // Prefer time-of-day matches; if none, fall back to all
  const timeMatches = pool.filter(o =>
    o.when.includes(timeTag) || (dayTag && o.when.includes(dayTag))
  );
  if (timeMatches.length >= 2) pool = timeMatches.concat(pool.filter(o => o.when.includes("any")));
  // Exclude the previous opener so we don't repeat
  const filtered = pool.filter(o => o.id !== lastId);
  if (filtered.length > 0) pool = filtered;

  const choice = pool[Math.floor(Math.random() * pool.length)];
  try { localStorage.setItem("orion.lastOpener", choice.id); } catch {}
  return choice;
}

const SUGGESTED_PROMPTS = [
  { icon: "report",   label: "Brief me on Q3 launch",      prompt: "Brief me on the Q3 launch — what's done, what's left, where I'm needed." },
  { icon: "search",   label: "What did Sable find?",        prompt: "What did @Sable find this week worth my attention?" },
  { icon: "sparkles", label: "Draft a partnership post",    prompt: "Draft three variants for a partnership announcement on LinkedIn." },
  { icon: "chart",    label: "Show channel performance",    prompt: "How are our channels performing this week vs last?" },
];

const QUICK_REPLIES_DEFAULT = [
  { short: "Brief me",    full: "Give me a quick brief on what matters this week." },
  { short: "Draft",       full: "Draft a campaign you think we should run." },
  { short: "Show status", full: "What's the status of everything you're working on right now?" },
];

const MENTIONABLE = [
  { name: "Lyra",  role: "Social"     },
  { name: "Sable", role: "Research"   },
  { name: "Hale",  role: "Sales"      },
  { name: "Atlas", role: "Growth"     },
  { name: "Vega",  role: "SEO"        },
  { name: "Cael",  role: "Analytics"  },
];

function buildOrionReply(prompt) {
  const lower = prompt.toLowerCase();
  const mentionsRaw = (prompt.match(/@(\w+)/g) || []).map(m => m.slice(1));
  // De-dupe and normalize-case against MENTIONABLE
  const mentions = [...new Set(mentionsRaw.map(m =>
    MENTIONABLE.find(x => x.name.toLowerCase() === m.toLowerCase())?.name || m
  ))];

  if (mentions.length > 0) {
    const list = mentions.length === 1
      ? mentions[0]
      : mentions.slice(0, -1).join(", ") + " and " + mentions.slice(-1)[0];
    return `On it — I'll loop ${list} in now and route the relevant context. ${mentions[0]} should have something back within the hour; I'll fold it into the next pass and bring it to you with a recommendation.`;
  }

  if (lower.includes("launch") || lower.includes("q3")) {
    return "I'm already on the Q3 launch — blog, email, X thread, and LinkedIn variants are drafted and embargoed for Thursday 09:00 PT. The blog anchors at 09:00, email follows at 09:30, social at 10:00. If you want to shift positioning, give me the angle and I'll rebuild the lead in 10 minutes. Otherwise I'll hold the line.";
  }
  if (lower.includes("brief") || lower.includes("recap") || lower.includes("status") || lower.includes("update")) {
    return "Quick read: three things in flight — Q3 launch (Thursday), Coil partnership PR (Friday), May customer monthly (Monday). Two waiting on you — the launch variants and the newsletter subject-line A/B. Everything else is steady-state. Want me to drop a full brief in your inbox?";
  }
  if (lower.includes("draft") || lower.includes("write") || lower.includes("post")) {
    return "On it. I'll draft three variants — one safe, one with your angle, one that takes a swing. You can pick or send me back to the drawing board. Estimated 8 minutes for the trio; I'll route to Lyra for the social cut once you sign off.";
  }
  if (lower.includes("competitor") || lower.includes("market") || lower.includes("sable")) {
    return "Sable has fresh data on this. Headline: three of seven tracked competitors moved off seat-based pricing in the last 60 days. I'd recommend folding that into the Q3 narrative if you haven't already. Want me to pull her brief or just give you the takeaway?";
  }
  if (lower.includes("performance") || lower.includes("metric") || lower.includes("analytics") || lower.includes("channel")) {
    return "Top line: open rates +1.2 pts WoW, reel saves up 2.3× since the hook update, LinkedIn long-form is now outperforming X by 3.1× for technical posts. Bottom line: shift more launch budget to LinkedIn this cycle. Full breakdown lives in Channel analytics.";
  }

  return "Heard you. Let me think about this — I'll come back within the hour with a plan and a first draft. If you want to redirect mid-stream just say the word; I'll pivot.";
}

// Helper to render text with @mentions highlighted
const renderWithMentions = (text) => {
  const parts = text.split(/(@\w+)/g);
  return parts.map((p, i) => p.startsWith("@") ? <span key={i} className="mention">{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>);
};

const OrionHome = ({ agent, onPick, orionState, setOrionState, whispers, addWhisper, typewriterPlayed, onTypewriterPlayed, opener }) => {
  const promptQuestion = opener?.text || PROMPT_QUESTION;
  const quickReplies   = opener?.chips || QUICK_REPLIES_DEFAULT;
  const [prompt, setPrompt] = React.useState("");
  // If the typewriter has already played during this hub session, skip the animation
  // and render the prompt in its final state immediately. Otherwise animate from "".
  const [typed, setTyped] = React.useState(typewriterPlayed ? promptQuestion : "");
  const [typingDone, setTypingDone] = React.useState(typewriterPlayed);
  const [inputRevealed, setInputRevealed] = React.useState(typewriterPlayed);
  const [messages, setMessages] = React.useState([]); // {id, role, text, displayed}
  const [mention, setMention] = React.useState(null); // {query, start}
  const [mentionIdx, setMentionIdx] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  // 'auto' | 'open' | 'closed' — once user clicks toggle, becomes 'open' or 'closed' (their preference)
  const [whisperPref, setWhisperPref] = React.useState(() => {
    try { return localStorage.getItem("orion.whisper.pref") || "auto"; } catch { return "auto"; }
  });
  const [whisperLastSeen, setWhisperLastSeen] = React.useState(whispers.length);
  const textareaRef = React.useRef(null);
  const threadEndRef = React.useRef(null);

  const hasInteracted = messages.length > 0 || prompt.length > 0;
  // Compact when blurred AND nothing typed AND no conversation. Otherwise expand.
  const isCompact = !focused && prompt.length === 0 && messages.length === 0;
  // Auto-collapse the whisper feed once a conversation starts; user pref overrides.
  const whisperCollapsed =
    whisperPref === "closed" ? true :
    whisperPref === "open"   ? false :
    /* auto */                  messages.length > 0;
  const unseen = Math.max(0, whispers.length - whisperLastSeen);

  const toggleWhisper = () => {
    const next = whisperCollapsed ? "open" : "closed";
    setWhisperPref(next);
    try { localStorage.setItem("orion.whisper.pref", next); } catch {}
    if (!whisperCollapsed) {
      // currently open → user is collapsing
    } else {
      // currently collapsed → user is opening, reset unseen
      setWhisperLastSeen(whispers.length);
    }
  };

  // When the feed is expanded, track the last seen count so unseen indicator clears.
  React.useEffect(() => {
    if (!whisperCollapsed) setWhisperLastSeen(whispers.length);
  }, [whisperCollapsed, whispers.length]);

  // 1. Typewriter — Orion turns to face you and asks the question.
  // Only runs the first time the user enters Orion's hub; skipped on internal nav.
  React.useEffect(() => {
    if (typewriterPlayed) return;
    let i = 0;
    let intervalId;
    const startDelay = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setTyped(promptQuestion.slice(0, i));
        if (i >= promptQuestion.length) {
          clearInterval(intervalId);
          setTypingDone(true);
          setTimeout(() => {
            setInputRevealed(true);
            onTypewriterPlayed && onTypewriterPlayed();
          }, 320);
        }
      }, 42);
    }, 700);
    return () => { clearTimeout(startDelay); if (intervalId) clearInterval(intervalId); };
  }, []);

  // Cycle "currently thinking about"
  const ideas = [
    "weaving Sable's pricing brief into a Q3 narrative",
    "auditing tone consistency across Friday's launch posts",
    "comparing this week's open rates to the May baseline",
    "drafting a partnership announcement variant for LinkedIn",
  ];
  const [ideaIdx, setIdeaIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdeaIdx(i => (i + 1) % ideas.length), 4200);
    return () => clearInterval(t);
  }, []);

  // 3. Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const checkin =
    hour < 11 ? "First time you've checked in today. I've been busy overnight — everything's queued."
    : hour < 14 ? "You haven't checked in since this morning. Here's what's ready for your read."
    : hour < 18 ? "Good to see you back this afternoon. A few things heated up since lunch."
    :             "Wrapping up the day — three things still need you tonight.";

  // 1. Send a prompt → user message → streamed reply
  const submitPrompt = (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    const userId  = "u-" + Date.now();
    const orionId = "o-" + Date.now() + "-r";
    const reply   = buildOrionReply(text);

    // 7. Whisper feed live insertion
    addWhisper && addWhisper({
      action: <><span className="tgt">Heard</span> a brief from you <span className="dim">— "{text.length > 56 ? text.slice(0, 56) + "…" : text}"</span></>,
      meta: "responding now",
    });

    setMessages(prev => [...prev, { id: userId, role: "user", text, displayed: text }]);
    setPrompt("");
    setMention(null);
    setOrionState("thinking");

    setTimeout(() => {
      setOrionState("typing");
      setMessages(prev => [...prev, { id: orionId, role: "orion", text: reply, displayed: "" }]);

      let j = 0;
      const stream = setInterval(() => {
        j += 2;
        setMessages(prev => prev.map(m =>
          m.id === orionId ? { ...m, displayed: reply.slice(0, j) } : m
        ));
        if (j >= reply.length) {
          clearInterval(stream);
          setMessages(prev => prev.map(m =>
            m.id === orionId ? { ...m, displayed: reply } : m
          ));
          setOrionState("idle");
          // Second whisper line — Orion just replied
          addWhisper && addWhisper({
            action: <><span className="tgt">Replied</span> in the thread <span className="dim">— I have a plan and a draft queued for you</span></>,
            meta: "ready",
          });
        }
      }, 22);
    }, 720);
  };

  // Scroll thread into view as it grows
  React.useEffect(() => {
    if (messages.length > 0 && threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages.length]);

  // 4. Mention handling on textarea change
  const handlePromptChange = (e) => {
    const text = e.target.value;
    setPrompt(text);
    const cursor = e.target.selectionStart;
    const slice = text.slice(0, cursor);
    const lastAt = slice.lastIndexOf("@");
    if (lastAt >= 0 && (lastAt === 0 || /\s/.test(slice[lastAt - 1]))) {
      const query = slice.slice(lastAt + 1);
      if (!/\s/.test(query)) {
        setMention({ query, start: lastAt });
        setMentionIdx(0);
        return;
      }
    }
    setMention(null);
  };

  const insertMention = (name) => {
    if (!mention) return;
    const before = prompt.slice(0, mention.start);
    const after = prompt.slice(mention.start + 1 + mention.query.length);
    const next = `${before}@${name} ${after}`;
    setPrompt(next);
    setMention(null);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const pos = (before + "@" + name + " ").length;
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    const filtered = mention
      ? MENTIONABLE.filter(m => m.name.toLowerCase().startsWith(mention.query.toLowerCase()))
      : [];

    if (mention && filtered.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIdx(i => (i + 1) % filtered.length); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setMentionIdx(i => (i - 1 + filtered.length) % filtered.length); return; }
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        insertMention(filtered[mentionIdx].name);
        return;
      }
      if (e.key === "Tab") { e.preventDefault(); insertMention(filtered[mentionIdx].name); return; }
      if (e.key === "Escape") { e.preventDefault(); setMention(null); return; }
    }

    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submitPrompt(prompt);
    }
  };

  const mentionMatches = mention
    ? MENTIONABLE.filter(m => m.name.toLowerCase().startsWith(mention.query.toLowerCase()))
    : [];

  return (
    <div className="orion-main">
      <div className="orion-greeting">
        <OrionMark agent={agent} state={orionState} />
        <div>
          <h1 className="orion-hi">{greeting}, Jordan.</h1>
          <div className="orion-sub">{checkin}</div>
          <div className="orion-thinking">
            <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            <span>
              {orionState === "thinking" && "Thinking through what you asked…"}
              {orionState === "typing"   && "Typing a reply for you…"}
              {orionState === "idle"     && <>Currently {ideas[ideaIdx]}</>}
            </span>
          </div>
        </div>
      </div>

      <div className="orion-brief">
        <div className="orion-brief-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l16-8-3 18-5-7z" />
            <path d="M11 14l-3 7" />
          </svg>
        </div>
        <div className="orion-brief-body">
          <span className="open">Before you start —</span>
          Sable surfaced <b>three competitor pricing moves</b> this week — Acme, Northwind, and Coil are all converging on usage hybrids. I've folded that into the <b>Q3 launch narrative</b> and have <em>4 channel variants</em> embargoed for Thursday 09:00 PT. There's also a partnership PR draft and the May customer monthly waiting on you.
        </div>
      </div>

      <div className="orion-prompt-typed" aria-live="polite">
        {typed}
        <span className={"orion-cursor" + (inputRevealed ? " idle" : "")} aria-hidden="true"></span>
        {/* 8. Quick-reply tail chips — inline with the typed question */}
        {typingDone && !hasInteracted && (
          <span className="orion-tail-chips">
            {quickReplies.map(q => (
              <button key={q.short} className="orion-tail-chip" onClick={() => submitPrompt(q.full)}>
                {q.short}
              </button>
            ))}
          </span>
        )}
      </div>

      {/* 2. Suggested prompts — only when no conversation yet */}
      {inputRevealed && !hasInteracted && (
        <div className="orion-suggested">
          {SUGGESTED_PROMPTS.map(s => (
            <button key={s.label} className="orion-suggested-card" onClick={() => submitPrompt(s.prompt)}>
              <Icon name={s.icon} size={14} />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 1. Conversation thread */}
      {messages.length > 0 && (
        <div className="orion-thread">
          {messages.map(m => m.role === "user" ? (
            <div key={m.id} className="orion-msg orion-msg--you">
              <div>
                <div className="orion-msg-meta">You · just now</div>
                <div className="orion-msg-body">{renderWithMentions(m.text)}</div>
              </div>
            </div>
          ) : (
            <div key={m.id} className="orion-msg orion-msg--orion">
              <OrionMark agent={agent} state={m.displayed.length < m.text.length ? "typing" : "idle"} size="sm" />
              <div>
                <div className="orion-msg-meta">Orion · {agent.role}</div>
                <div className="orion-msg-body">
                  {renderWithMentions(m.displayed)}
                  {m.displayed.length < m.text.length && <span className="orion-cursor inline" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>
      )}

      <div className={"orion-prompt-wrap" + (inputRevealed ? " revealed" : "")}>
        <div className={"orion-textarea-wrap" + (isCompact ? " compact" : "")}>
          <textarea
            ref={textareaRef}
            className="orion-textarea"
            value={prompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={
              isCompact
                ? "Or type your own question…"
                : messages.length > 0
                  ? "Keep going — type @ to bring in Lyra, Sable, or Hale."
                  : "Tell me your focus — a campaign idea, a topic to amplify, a narrative shift. Type @ to bring in your team. Or just ask what I'd recommend."
            }
          />

          {/* 4. Mention picker */}
          {mention && mentionMatches.length > 0 && (
            <div className="orion-mention-picker">
              <div className="orion-mention-head">Loop in</div>
              {mentionMatches.slice(0, 6).map((m, i) => (
                <button
                  key={m.name}
                  className={"orion-mention-item" + (i === mentionIdx ? " focused" : "")}
                  onMouseEnter={() => setMentionIdx(i)}
                  onClick={() => insertMention(m.name)}
                >
                  <span className="orion-mention-mark" style={{
                    background: "var(--bg-3)",
                    color: "var(--fg-1)",
                  }}>{m.name.slice(0, 2).toUpperCase()}</span>
                  <span>{m.name}</span>
                  <span className="orion-mention-role">{m.role}</span>
                </button>
              ))}
            </div>
          )}

          <div className="orion-textarea-foot">
            <span className="orion-textarea-hint">
              {prompt.length === 0
                ? (messages.length > 0
                    ? "Orion is in the thread with you. Type @ to add a teammate."
                    : "Type @ to bring Lyra, Sable, Hale, or another teammate into the conversation.")
                : `${prompt.length} chars · I'm listening.`}
            </span>
            <button className="ask-orion-btn" disabled={prompt.trim().length === 0} onClick={() => submitPrompt(prompt)}>
              Ask Orion
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
              </svg>
              <span className="kbd">⌘↵</span>
            </button>
          </div>
        </div>
      </div>

      <div className={"orion-stage" + (inputRevealed ? " revealed" : "")}>
        <div className="orion-actions">
          <button
            className="orion-action primary"
            onClick={() => addWhisper && addWhisper({
              action: <><span className="tgt">Pulling</span> fresh insights for you <span className="dim">— scanning competitor channels and last 7d performance</span></>,
              meta: "≈ 2 min",
            })}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
            </svg>
            Get fresh insights now
          </button>
          <button className="orion-action" onClick={() => onPick("campaign")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l16-8-3 18-5-7z" /><path d="M11 14l-3 7" />
            </svg>
            Start a new campaign
          </button>
          <button className="orion-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="3" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
              <circle cx="17" cy="9" r="2.5" /><path d="M14 20c0-2 2-3.5 4-3.5s4 1.5 4 3.5" />
            </svg>
            About my team
          </button>
          <button className="orion-action" onClick={() => onPick("tasks")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3 8-8" />
              <path d="M20 12v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
            </svg>
            Assign task
          </button>
        </div>

        <div className="orion-pills">
          <button className="orion-pill" onClick={() => onPick("approvals")}>
            <span className="pill-dot"></span> 3 posts awaiting your approval
          </button>
          <button className="orion-pill" onClick={() => onPick("design")}>
            <span className="pill-dot info"></span> 7 design briefs ready
          </button>
          <button className="orion-pill" onClick={() => onPick("email")}>
            <span className="pill-dot violet"></span> 1 newsletter drafted
          </button>
          <button className="orion-pill" onClick={() => onPick("publishing")}>
            <span className="pill-dot ok"></span> 4 scheduled · embargo Thu 09:00
          </button>
          <button className="orion-pill" onClick={() => onPick("brand")}>
            <span className="pill-dot warn"></span> 1 brand inconsistency autofixed
          </button>
        </div>

        <div className={"orion-whisper" + (whisperCollapsed ? " collapsed" : "")}>
          <div className="orion-whisper-head">
            <div className="orion-whisper-title">
              What I just did <span className="live">live</span>
            </div>
            <button className="orion-whisper-toggle" onClick={toggleWhisper}>
              {whisperCollapsed
                ? <>
                    {unseen > 0 && <span className="new-badge">+{unseen}</span>}
                    show
                  </>
                : "hide"}
              <span className="chev">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          </div>
          <div className="orion-whisper-body">
            {whispers.map((w, i) => (
              <div key={w.id} className={"orion-whisper-line" + (w.fresh ? " inserting" : "")}>
                <div className="orion-whisper-time">{w.time}</div>
                <div className="orion-whisper-action">{w.action}</div>
                <div className="orion-whisper-meta">{w.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Weekly brief sub-page ---
const OrionBrief = ({ agent }) => (
  <div className="orion-subpage">
    <div className="orion-subpage-head">
      <div>
        <div className="orion-subpage-eyebrow">Studio · Weekly brief · Week 22</div>
        <h1 className="orion-subpage-title">Here's what's worth your time this week.</h1>
        <div className="orion-subpage-sub">
          A short read from Orion. Three signals to act on, three things you can ignore, and what's heating up.
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn"><Icon name="report" size={13} />Open as PDF</button>
        <AskOrionButton agent={agent} />
        <button className="btn primary">Approve & post</button>
      </div>
    </div>

    <div className="brief-section">
      <div className="brief-section-title">Three signals worth acting on</div>
      <div className="brief-grid">
        <div className="brief-card">
          <div className="bc-eyebrow">01 · Pricing</div>
          <div className="bc-title">Acme, Northwind, and Coil converged on usage-hybrid pricing</div>
          <div className="bc-body">Three of seven tracked competitors moved off seat-based in 60 days. Sable's brief is the source. I'd recommend folding this into the Q3 launch positioning and running the pricing experiment we discussed in April.</div>
        </div>
        <div className="brief-card">
          <div className="bc-eyebrow">02 · Audience</div>
          <div className="bc-title">Save-rate on reels is now the strongest paid-conversion correlate</div>
          <div className="bc-body">Lyra's experiment confirms saves correlate 4× more than likes. I'm updating the scaffold prompt for all new reel briefs to optimize for save behavior. Mailer headlines will mirror this.</div>
        </div>
        <div className="brief-card">
          <div className="bc-eyebrow">03 · Channel</div>
          <div className="bc-title">Long-form LinkedIn is outperforming X for technical narratives</div>
          <div className="bc-body">7d engagement on long-form LI posts is 3.1× X threads for the same body copy. Recommending we lead the launch narrative on LI and use X for the playbook supplements.</div>
        </div>
        <div className="brief-card">
          <div className="bc-eyebrow">04 · Voice</div>
          <div className="bc-title">Brand-voice rule update — no em-dashes in long-form social</div>
          <div className="bc-body">Lyra audited the last 30 posts; em-dashes correlate with lower readability on mobile. I've codified this in shared memory; all of us are aligned.</div>
        </div>
      </div>
    </div>

    <div className="brief-section">
      <div className="brief-section-title">What's heating up — keep an eye</div>
      <div className="brief-grid">
        <div className="brief-card">
          <div className="bc-eyebrow">Trend · climbing</div>
          <div className="bc-title">"AI workforce" as a category term is up 84% in search volume</div>
          <div className="bc-body">From May 1 to today. Mostly enterprise-tier queries. Vega is monitoring; I'd like to commission a category-positioning brief from Sable if you agree.</div>
        </div>
        <div className="brief-card">
          <div className="bc-eyebrow">Trend · cooling</div>
          <div className="bc-title">"Prompt engineering" as a topic is declining — down 22% MoM</div>
          <div className="bc-body">Our two pieces in that cluster are losing reach. I'd let them age out rather than refresh — better signal to invest elsewhere.</div>
        </div>
      </div>
    </div>
  </div>
);

// --- Approve content sub-page ---
const OrionApprovals = ({ agent }) => {
  const items = [
    { id: "ap-q3-blog",   mark: "BLOG", title: "Q3 launch blog · 1,420 words",      sub: "Lead with the operator narrative. Pull-quote from Sable's brief at section 3. Embargo Thu 09:00.", meta: ["draft v4", "embargo Thu 09:00", "1,420 words"] },
    { id: "ap-q3-email",  mark: "EM",   title: "Q3 launch email · 3 A/B variants",  sub: "Three subject-line variants. Lyra recommends variant A (question-led).",                            meta: ["draft v3", "3 variants", "list · 18.4k"] },
    { id: "ap-coil-pr",   mark: "PR",   title: "Coil partnership press release",    sub: "Embargoed for Friday 10:00. I've cleared all three named quotes and run the legal check.",          meta: ["draft v3", "press list approved", "embargo Fri 10:00"] },
    { id: "ap-newsletter",mark: "NL",   title: "May customer monthly newsletter",   sub: "Lead with Q3 teaser, 3 customer stories, and a feature spotlight from Hale's pipeline.",            meta: ["draft v2", "list · 4.2k", "scheduled Mon 09:00"] },
  ];
  return (
    <div className="orion-subpage">
      <div className="orion-subpage-head">
        <div>
          <div className="orion-subpage-eyebrow">Studio · Approvals · 4 items</div>
          <h1 className="orion-subpage-title">I need your read on these.</h1>
          <div className="orion-subpage-sub">
            All four are launch-adjacent. The blog should go first (it anchors the others), then email, then PR. I'll publish in that order once you green-light.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn">Approve all</button>
          <AskOrionButton agent={agent} />
          <button className="btn primary">Open editor</button>
        </div>
      </div>

      {items.map(it => (
        <div className="approve-row" key={it.id}>
          <div className="ar-mark">{it.mark}</div>
          <div>
            <div className="ar-title">{it.title}</div>
            <div className="ar-sub">{it.sub}</div>
            <div className="ar-meta">
              {it.meta.map(m => <span className="tag" key={m}>{m}</span>)}
            </div>
          </div>
          <div className="ar-actions">
            <button className="btn">Open</button>
            <button className="btn">Comment</button>
            <button className="btn primary">Approve</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Generic placeholder sub-page (for surfaces with rich content elsewhere) ---
const OrionSubPlaceholder = ({ title, eyebrow, sub, body, agent, actions }) => (
  <div className="orion-subpage">
    <div className="orion-subpage-head">
      <div>
        <div className="orion-subpage-eyebrow">{eyebrow}</div>
        <h1 className="orion-subpage-title">{title}</h1>
        <div className="orion-subpage-sub">{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {actions}
        {agent && <AskOrionButton agent={agent} />}
      </div>
    </div>
    {body}
  </div>
);

const OrionDesignBriefs = ({ agent }) => {
  const briefs = [
    { mark: "FG", title: "Q3 launch — hero illustration system",      sub: "Need a 3-piece illustration set for the blog hero + email hero + LinkedIn. Tone: confident, infrastructural, not playful.", meta: ["design", "Q3", "hero"] },
    { mark: "FG", title: "Coil partnership — co-branded card",        sub: "Single graphic that works on LinkedIn and as the press release header. Their brand kit is in shared Drive.",            meta: ["partnership", "co-brand"] },
    { mark: "FG", title: "May newsletter — feature spotlight tile",   sub: "One tile for Hale's pipeline story. 1200×630 hero, 600×600 social crop, 16:9 mailer card.",                              meta: ["newsletter", "spotlight"] },
    { mark: "FG", title: "Pricing experiment — explainer diagram",    sub: "Diagram showing seat→usage hybrid model. Source: Sable's brief. Keep it clean, no flourishes.",                          meta: ["diagram", "pricing"] },
    { mark: "FG", title: "Brand guidelines — Q3 refresh PDF",         sub: "Updated voice rules (no em-dashes), accent usage, photography direction. Lives in Notion + PDF.",                        meta: ["guidelines", "Q3"] },
    { mark: "FG", title: "Speaker card system — 4 employees",         sub: "Templated speaker card for Atlas, Lyra, Vega, Mira when they're quoted externally.",                                     meta: ["templates"] },
    { mark: "FG", title: "Annual customer summit — save-the-date",    sub: "Email hero + landing page header for the summit announcement.",                                                          meta: ["event", "summit"] },
  ];
  return (
    <div className="orion-subpage">
      <div className="orion-subpage-head">
        <div>
          <div className="orion-subpage-eyebrow">Studio · Design briefs · 7 ready</div>
          <h1 className="orion-subpage-title">Briefs I'd like to hand to design.</h1>
          <div className="orion-subpage-sub">
            Each one is scoped, sourced, and ready to ship to your design partner or to a Figma agent. The Q3 hero set is the highest-leverage.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <AskOrionButton agent={agent} />
          <button className="btn primary"><Icon name="plus" size={13} />New brief</button>
        </div>
      </div>
      {briefs.map((b, i) => (
        <div className="approve-row" key={i}>
          <div className="ar-mark">{b.mark}</div>
          <div>
            <div className="ar-title">{b.title}</div>
            <div className="ar-sub">{b.sub}</div>
            <div className="ar-meta">{b.meta.map(m => <span className="tag" key={m}>{m}</span>)}</div>
          </div>
          <div className="ar-actions">
            <button className="btn">Open</button>
            <button className="btn primary">Send to design</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const OrionEmailDraft = ({ agent }) => (
  <OrionSubPlaceholder
    agent={agent}
    eyebrow="Studio · Email · 1 draft"
    title="May customer monthly — v2."
    sub="Lead block, three customer stories, and a feature spotlight from Hale's pipeline. Subject-line variants are A/B-set."
    body={
      <>
        <div className="brief-section">
          <div className="brief-section-title">Subject line · 3 variants</div>
          <div className="brief-grid">
            <div className="brief-card">
              <div className="bc-eyebrow">Variant A</div>
              <div className="bc-title">"What's coming in Q3 (and why now)"</div>
              <div className="bc-body">Question-led. Aligned with Lyra's hook research. My recommendation.</div>
            </div>
            <div className="brief-card">
              <div className="bc-eyebrow">Variant B</div>
              <div className="bc-title">"Three things we shipped this month"</div>
              <div className="bc-body">Claim-led. Safer, but historically 1.4× lower open-rate.</div>
            </div>
            <div className="brief-card">
              <div className="bc-eyebrow">Variant C</div>
              <div className="bc-title">"Jordan's note · May edition"</div>
              <div className="bc-body">Operator-led. Worth testing once you're back from the launch cycle.</div>
            </div>
          </div>
        </div>
        <div className="brief-section">
          <div className="brief-section-title">Body</div>
          <div className="approve-row" style={{ display: "block", padding: "20px 24px" }}>
            <div style={{ fontSize: 13.5, color: "var(--fg-1)", lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 14px" }}>Hi {`{first_name}`},</p>
              <p style={{ margin: "0 0 14px" }}>Three things shipped this month that I think you'll care about — and one preview of what's next.</p>
              <p style={{ margin: "0 0 14px", color: "var(--fg-2)" }}>[Block 1: Hale's pipeline spotlight · 80 words]</p>
              <p style={{ margin: "0 0 14px", color: "var(--fg-2)" }}>[Block 2: Lyra's reel experiment results · 60 words]</p>
              <p style={{ margin: "0 0 14px", color: "var(--fg-2)" }}>[Block 3: Vega's docs improvements · 50 words]</p>
              <p style={{ margin: "0 0 14px" }}>And a quiet preview: Q3 launches Thursday. I'll send a separate note when it does.</p>
              <p style={{ margin: 0 }}>— Jordan</p>
            </div>
          </div>
        </div>
      </>
    }
  />
);

const OrionPublishing = ({ agent }) => (
  <OrionSubPlaceholder
    agent={agent}
    eyebrow="Studio · Publishing · scheduled"
    title="Where things are going this week."
    sub="Sequenced so the launch lands cleanly. The blog anchors, then email, then social fills the rest of the day."
    body={
      <div className="brief-section">
        <div className="brief-section-title">This week's schedule</div>
        {[
          { day: "Thu May 18", time: "09:00 PT", title: "Q3 launch blog goes live", meta: "Anchor · WordPress" },
          { day: "Thu May 18", time: "09:30 PT", title: "Q3 launch email · variant A to full list (18.4k)", meta: "Mailer · A/B holdout 5%" },
          { day: "Thu May 18", time: "10:00 PT", title: "LinkedIn long-form from Jordan", meta: "Personal account" },
          { day: "Thu May 18", time: "11:00 PT", title: "Lyra · IG reel #1 (variant B selected)", meta: "Auto-cross-post to FB" },
          { day: "Thu May 18", time: "14:00 PT", title: "X thread · launch playbook (11 posts)", meta: "Founder voice" },
          { day: "Fri May 19", time: "10:00 PT", title: "Coil partnership PR · embargo lifts", meta: "Press list · 42 outlets" },
          { day: "Mon May 22", time: "09:00 PT", title: "May customer monthly newsletter", meta: "Mailer · variant A" },
        ].map((s, i) => (
          <div className="approve-row" key={i}>
            <div className="ar-mark" style={{ fontSize: 9.5, textAlign: "center" }}>{s.day.split(" ")[1]}<br/>{s.day.split(" ")[2]}</div>
            <div>
              <div className="ar-title">{s.title}</div>
              <div className="ar-sub">{s.time} · {s.meta}</div>
            </div>
            <div className="ar-actions">
              <button className="btn">Edit</button>
              <button className="btn">Move</button>
            </div>
          </div>
        ))}
      </div>
    }
  />
);

const OrionTasks = ({ agent }) => {
  const sections = [
    {
      title: "In progress · I'm working on these now",
      items: [
        { mark: "Q3",  title: "Build the Q3 launch narrative across 4 channels", sub: "Assigned by you · May 12. Drafts are in approvals; embargo holds at Thu 09:00 PT.", state: "run",  meta: ["high priority", "T-2", "linked to Sable's brief"] },
        { mark: "PR",  title: "Coil partnership press push",                     sub: "Assigned by you · May 14. PR draft v3 cleared by legal; embargo Fri 10:00.",      state: "run",  meta: ["partnership", "embargo Fri 10:00"] },
        { mark: "NL",  title: "May customer monthly newsletter",                  sub: "Standing assignment. Draft v2 is waiting on your read of the subject-line A/B.", state: "wait", meta: ["awaiting your review"] },
      ],
    },
    {
      title: "Up next · I'll start these once the launch lands",
      items: [
        { mark: "EXP", title: "Pricing experiment narrative — blog + sales enablement", sub: "Assigned by you · May 14. Holding for Sable's recap; expected end of week.", state: "wait", meta: ["Q3", "blocked on Sable"] },
        { mark: "EVT", title: "Annual customer summit · save-the-date",                 sub: "Assigned by you · May 9. Concept phase. Needs venue + speaker direction from you.", state: "wait", meta: ["Aug", "concept"] },
      ],
    },
    {
      title: "Recently completed",
      items: [
        { mark: "✓",   title: "Brand voice rule update — no em-dashes in long-form social", sub: "Codified in shared memory; Lyra and Sable are aligned.", state: "done", meta: ["2d ago"] },
        { mark: "✓",   title: "April customer monthly · sent",                              sub: "32.4% open rate, +1.2 pts wow. Top click: Hale's pipeline spotlight.", state: "done", meta: ["sent Apr 28"] },
        { mark: "✓",   title: "Refresh paid placements · 6 publications",                   sub: "Monthly · $4,200. No changes from May.", state: "done", meta: ["recurring"] },
      ],
    },
  ];

  const counts = {
    inflight: sections[0].items.length,
    upnext: sections[1].items.length,
    done: sections[2].items.length,
    blocked: sections[1].items.filter(i => i.state === "wait").length + sections[0].items.filter(i => i.state === "wait").length,
  };

  return (
    <div className="orion-subpage">
      <div className="orion-subpage-head">
        <div>
          <div className="orion-subpage-eyebrow">Studio · Tasks · {counts.inflight + counts.upnext} open</div>
          <h1 className="orion-subpage-title">What you've asked me to do.</h1>
          <div className="orion-subpage-sub">
            Tasks you've assigned, in flight, queued, or recently shipped. I'll surface a status check here whenever something needs your unblock.
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn"><Icon name="filter" size={13} />Filter</button>
          <AskOrionButton agent={agent} />
          <button className="btn primary"><Icon name="plus" size={13} />Assign task</button>
        </div>
      </div>

      <div className="brief-grid" style={{ marginBottom: 24 }}>
        <div className="brief-card"><div className="bc-eyebrow">In flight</div><div className="bc-title">{counts.inflight}</div><div className="bc-body">Active work.</div></div>
        <div className="brief-card"><div className="bc-eyebrow">Up next</div><div className="bc-title">{counts.upnext}</div><div className="bc-body">Queued behind the launch.</div></div>
        <div className="brief-card"><div className="bc-eyebrow">Waiting on you</div><div className="bc-title">{counts.blocked}</div><div className="bc-body">Need a decision or unblock.</div></div>
        <div className="brief-card"><div className="bc-eyebrow">Shipped · 14d</div><div className="bc-title">{counts.done}</div><div className="bc-body">Recently completed.</div></div>
      </div>

      {sections.map((sec, si) => (
        <div className="brief-section" key={si}>
          <div className="brief-section-title">{sec.title}</div>
          {sec.items.map((t, i) => (
            <div className="approve-row" key={i}>
              <div className="ar-mark">{t.mark}</div>
              <div>
                <div className="ar-title">
                  {t.title}
                  {t.state === "wait" && (
                    <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--warn)", background: "var(--warn-soft)", padding: "2px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      waiting
                    </span>
                  )}
                  {t.state === "run" && (
                    <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      in flight
                    </span>
                  )}
                  {t.state === "done" && (
                    <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ok)", background: "var(--ok-soft)", padding: "2px 7px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      done
                    </span>
                  )}
                </div>
                <div className="ar-sub">{t.sub}</div>
                <div className="ar-meta">{t.meta.map(m => <span className="tag" key={m}>{m}</span>)}</div>
              </div>
              <div className="ar-actions">
                {t.state === "wait" && <button className="btn primary">Unblock</button>}
                {t.state === "run"  && <button className="btn">Status</button>}
                <button className="btn">Open</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const OrionCampaign = ({ agent }) => (
  <OrionSubPlaceholder
    agent={agent}
    eyebrow="Studio · Campaigns · 3 live · 2 in flight"
    title="Campaigns I'm running."
    sub="The Q3 launch is the priority — everything else is steady-state. I'll deprioritize the rest if you need bandwidth."
    body={
      <div className="brief-grid">
        {[
          { title: "Q3 product launch — multi-channel", state: "In flight · waiting on you", days: "T-2", channels: "Blog · Email · Social · PR · Paid" },
          { title: "May customer monthly", state: "Drafted · waiting on you", days: "Sends Mon", channels: "Email · 4.2k list" },
          { title: "Coil partnership announcement", state: "Embargoed · Fri lift", days: "T-3", channels: "PR · LinkedIn · Email" },
          { title: "Annual customer summit · save-the-date", state: "Ideation", days: "Aug", channels: "Email · Landing · PR" },
          { title: "Pricing experiment narrative", state: "Concept · awaiting Sable's recap", days: "Q3", channels: "Blog · Email · Sales-enablement" },
        ].map((c, i) => (
          <div className="brief-card" key={i}>
            <div className="bc-eyebrow">{c.state} · {c.days}</div>
            <div className="bc-title">{c.title}</div>
            <div className="bc-body">{c.channels}</div>
          </div>
        ))}
      </div>
    }
  />
);

const OrionGenericPlaceholder = ({ heading, agent }) => (
  <OrionSubPlaceholder
    agent={agent}
    eyebrow={`Workspace · ${heading}`}
    title={heading + "."}
    sub="This surface lives elsewhere in the platform — opens in the workspace-wide view."
    body={
      <div className="tab-empty">
        <div className="icn"><Icon name="arrowRight" size={16} /></div>
        <div>This will route to the workspace-wide {heading.toLowerCase()} view, scoped to Orion.</div>
      </div>
    }
  />
);

// ----------- Orion hub shell -----------
// Manages: active tab, orionState (idle | thinking | typing),
// transition overlay, and the live whisper feed.
const NAV_LABEL = (id) => {
  for (const sec of ORION_NAV) {
    const it = sec.items.find(x => x.id === id);
    if (it) return it.label;
  }
  return id;
};

const INITIAL_WHISPERS = [
  { id: "w0", time: "now",  action: <><span className="tgt">Drafted</span> launch announcement <span className="dim">v4 with embedded ICP quote from Sable</span></>, meta: "→ awaiting your review" },
  { id: "w1", time: "12m",  action: <><span className="tgt">Read</span> Sable's Q3 competitive brief <span className="dim">(18 pages · pricing convergence note)</span></>, meta: "linked to launch" },
  { id: "w2", time: "32m",  action: <><span className="tgt">Held</span> embargo at Thursday 09:00 PT <span className="dim">across all 4 channels</span></>, meta: "synced w/ Lyra" },
  { id: "w3", time: "1h",   action: <><span className="tgt">Refreshed</span> brand consistency check <span className="dim">— 1 inconsistency in PR variant, autofixed</span></>, meta: "no action needed" },
  { id: "w4", time: "2h",   action: <><span className="tgt">Asked</span> Lyra <span className="dim">to queue reels behind blog publish</span></>, meta: "confirmed" },
];

const OrionHub = ({ agent, onBack }) => {
  const [active, setActive] = React.useState("home");
  const [transitionTo, setTransitionTo] = React.useState(null);
  const [transitionTyped, setTransitionTyped] = React.useState("");
  const [orionState, setOrionState] = React.useState("idle");
  const [whispers, setWhispers] = React.useState(INITIAL_WHISPERS);
  // Tracks whether the home typewriter has played during this hub session.
  // Resets when OrionHub itself unmounts (i.e. you leave Orion's hub).
  const [typewriterPlayed, setTypewriterPlayed] = React.useState(false);
  // Pick an opener once per hub mount — varies on each return visit.
  const [opener] = React.useState(() => pickOrionOpener());

  // 7. Shared whisper insertion — prepend new lines with a fresh flag.
  const addWhisper = React.useCallback((line) => {
    const id = "w-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    setWhispers(prev => [{ id, time: "now", fresh: true, ...line }, ...prev.slice(0, 12)]);
    // After animation, drop the fresh flag so it doesn't re-animate on re-render
    setTimeout(() => {
      setWhispers(prev => prev.map(w => w.id === id ? { ...w, fresh: false } : w));
    }, 700);
  }, []);

  // 6. Sub-page transition — "Pulling up X..." typed overlay
  const handlePick = React.useCallback((nextId) => {
    if (nextId === active) return;
    if (nextId === "home") {
      // No transition for home — feels natural
      setActive("home");
      return;
    }
    const label = NAV_LABEL(nextId);
    const fullText = `Pulling up ${label}…`;
    setTransitionTo(nextId);
    setTransitionTyped("");
    let i = 0;
    const stream = setInterval(() => {
      i++;
      setTransitionTyped(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(stream);
    }, 24);
    setTimeout(() => {
      setActive(nextId);
      setTransitionTo(null);
    }, 520);
  }, [active]);

  const renderBody = () => {
    switch (active) {
      case "home":       return <OrionHome agent={agent} onPick={handlePick} orionState={orionState} setOrionState={setOrionState} whispers={whispers} addWhisper={addWhisper} typewriterPlayed={typewriterPlayed} onTypewriterPlayed={() => setTypewriterPlayed(true)} opener={opener} />;
      case "brief":      return <OrionBrief agent={agent} />;
      case "approvals":  return <OrionApprovals agent={agent} />;
      case "design":     return <OrionDesignBriefs agent={agent} />;
      case "email":      return <OrionEmailDraft agent={agent} />;
      case "publishing": return <OrionPublishing agent={agent} />;
      case "campaign":   return <OrionCampaign agent={agent} />;
      case "tasks":      return <OrionTasks agent={agent} />;
      case "analytics":  return <OrionGenericPlaceholder agent={agent} heading="Channel analytics" />;
      case "audience":   return <OrionGenericPlaceholder agent={agent} heading="Audience audit" />;
      case "brand":      return <OrionGenericPlaceholder agent={agent} heading="Brand consistency" />;
      case "competitors":return <OrionGenericPlaceholder agent={agent} heading="Competitor watch" />;
      case "connectors": return <OrionGenericPlaceholder agent={agent} heading="Connectors" />;
      case "memory":     return <OrionGenericPlaceholder agent={agent} heading="Memory" />;
      case "settings":   return <OrionGenericPlaceholder agent={agent} heading="Settings" />;
      default:           return <OrionHome agent={agent} onPick={handlePick} orionState={orionState} setOrionState={setOrionState} whispers={whispers} addWhisper={addWhisper} typewriterPlayed={typewriterPlayed} onTypewriterPlayed={() => setTypewriterPlayed(true)} opener={opener} />;
    }
  };

  return (
    <div className="fade-in" key={agent.id}>
      <div className="orion-shell">
        <div className="orion-body-host">
          {renderBody()}
          {transitionTo && (
            <div className="orion-transition">
              <OrionMark agent={agent} state="typing" />
              <div className="orion-transition-text">
                {transitionTyped}
                <span className="cursor" />
              </div>
            </div>
          )}
        </div>
        <OrionSideNav active={active} onPick={handlePick} />
      </div>
    </div>
  );
};

window.OrionHub = OrionHub;
