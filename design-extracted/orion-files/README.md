# Orion — Marketing Manager Dashboard

The conversational AI-employee hub for Orion, extracted from the Winglo workspace.

## Files

### Orion-specific
| File | Purpose |
|---|---|
| `agent-orion.jsx` | Main hub: home, conversation, openers, mention picker, transition overlay, all sub-pages (Brief, Approvals, Tasks, Design briefs, Email draft, Publishing, Campaigns, placeholders) |
| `orion-app.jsx` | Standalone entry point — renders just `<OrionHub />` |
| `agent-orion.css` | All Orion styles: greeting, briefing, typewriter, thread, mentions, chips, sidenav, sub-pages, whisper feed |
| `orion-standalone.css` | Full-viewport overrides for the standalone build |
| `Orion.html` | Standalone source page |
| `Orion (standalone).html` | **Bundled single-file output — open this offline** |

### Shared dependencies
| File | Purpose |
|---|---|
| `styles.css` | Design tokens (colors, type, spacing), buttons, layout primitives |
| `hub-tabs.css` | Shared sub-page patterns (`.brief-section`, `.approve-row`, `.tab-empty`) |
| `data.js` | Agent identity data (Orion = `AGENT_BY_ID.marketing`) |
| `icons.jsx` | `<Icon>` component |

## Run it
- **Offline:** open `Orion (standalone).html` directly in any browser. Single self-contained file.
- **Development:** serve the folder over HTTP (e.g. `python -m http.server`) and open `Orion.html`.

## Architecture notes
- Orion's home is a stateful conversation surface, not a form. Typewriter, thread, mentions, and whisper feed all live in `OrionHome`.
- Opener selection (`pickOrionOpener`) varies the greeting question on each return visit based on time of day, day of week, and last-shown opener (persisted to `localStorage`).
- Sub-page navigation is handled by `OrionHub` with a typed "Pulling up X…" transition.
- The typewriter only plays the first time you enter Orion's hub in a session — internal nav between sub-pages skips it.
