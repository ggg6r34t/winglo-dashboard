'use client'

import { useState } from 'react'
import type { AgentConfig } from '@/lib/agents/registry'

type CalEvent = { time: string; title: string; kind: string; tag: string }
type AgentCalendar = Record<number, CalEvent[]>

const CALENDARS: Record<string, AgentCalendar> = {
  'social-media': {
    16: [{ time: '09:00', title: 'IG reel — Welcome to Winglo (refresh)',  kind: 'post',      tag: 'IG'  },
         { time: '13:00', title: 'TT short — meet the team',               kind: 'post',      tag: 'TT'  },
         { time: '16:30', title: 'LI post — engineering deep-dive',        kind: 'post',      tag: 'LI'  }],
    17: [{ time: '10:00', title: 'IG reel — Q3 teaser planning',           kind: 'draft',     tag: 'IG'  }],
    18: [{ time: '09:00', title: 'IG reel — Q3 teaser #1',                 kind: 'scheduled', tag: 'IG'  },
         { time: '11:00', title: 'LI post — partnership w/ Coil',          kind: 'scheduled', tag: 'LI'  }],
    19: [{ time: '09:00', title: 'X thread — launch day playbook',         kind: 'scheduled', tag: 'X'   }],
    20: [{ time: '13:00', title: 'IG reel — Q3 teaser #2 (variant B)',     kind: 'scheduled', tag: 'IG'  }],
    22: [{ time: '09:00', title: 'Weekly content review',                  kind: 'ops',       tag: 'OPS' }],
  },
  growth: {
    16: [{ time: '07:00', title: 'Outbound batch · 280 contacts',          kind: 'ops',     tag: 'OUT' },
         { time: '11:00', title: 'Maya Chen · demo follow-up',             kind: 'task',    tag: 'EM'  }],
    17: [{ time: '11:00', title: 'Coil · partnership exec call',           kind: 'meeting', tag: 'MTG' }],
    18: [{ time: '07:00', title: 'Outbound batch · post-launch',           kind: 'ops',     tag: 'OUT' }],
    20: [{ time: '10:00', title: 'Stride · technical Q&A response',        kind: 'task',    tag: 'EM'  }],
    22: [{ time: '09:00', title: 'Weekly ICP recalibration',               kind: 'ops',     tag: 'OPS' }],
  },
  seo: {
    16: [{ time: '02:00', title: 'Daily regression audit',                 kind: 'ops',  tag: 'CRW' },
         { time: '14:00', title: 'PR #1284 · canonical fixes',             kind: 'task', tag: 'PR'  }],
    17: [{ time: '02:00', title: 'Daily regression audit',                 kind: 'ops',  tag: 'CRW' }],
    18: [{ time: '02:00', title: 'Daily regression audit',                 kind: 'ops',  tag: 'CRW' }],
    19: [{ time: '02:00', title: 'Daily regression audit',                 kind: 'ops',  tag: 'CRW' }],
    20: [{ time: '02:00', title: 'Daily regression audit',                 kind: 'ops',  tag: 'CRW' }],
  },
  marketing: {
    16: [{ time: '14:00', title: 'Q3 launch approval review',              kind: 'task',   tag: 'APR' }],
    17: [{ time: '10:00', title: 'PR press list final-check',              kind: 'task',   tag: 'PR'  }],
    18: [{ time: '09:00', title: 'Q3 launch — embargo lifts',              kind: 'launch', tag: 'LCH' }],
    20: [{ time: '10:00', title: 'Coil partnership press release',         kind: 'task',   tag: 'PR'  }],
    22: [{ time: '16:00', title: 'Brand consistency review',               kind: 'ops',    tag: 'BR'  }],
  },
  sales: {
    16: [{ time: '10:00', title: 'Stage-4 stall review · weekly',         kind: 'ops',     tag: 'OPS' }],
    17: [{ time: '14:00', title: 'Northwind · proposal v3 send',          kind: 'task',    tag: '$$'  }],
    19: [{ time: '11:00', title: 'Maya Chen · demo',                      kind: 'meeting', tag: '$$'  }],
    20: [{ time: '15:00', title: 'Coil · partnership close',              kind: 'meeting', tag: '$$$' }],
    22: [{ time: '09:00', title: 'Pipeline review · weekly',              kind: 'ops',     tag: 'OPS' }],
  },
  telehealth: {
    16: [{ time: '06:00', title: 'Overnight triage handoff',              kind: 'ops',  tag: 'TRI' },
         { time: '09:30', title: 'P-1836 → Dr. Reyes',                   kind: 'task', tag: 'Dr'  }],
    17: [{ time: '22:00', title: 'Overnight triage shift',                kind: 'ops',  tag: 'TRI' }],
    18: [{ time: '22:00', title: 'Overnight triage shift',                kind: 'ops',  tag: 'TRI' }],
    19: [{ time: '10:00', title: 'Protocol review · chest-pain cluster',  kind: 'ops',  tag: 'POL' }],
  },
  'analytics-manager': {
    16: [{ time: '13:12', title: 'Pipeline velocity · W22 delivered',     kind: 'task', tag: 'RPT' }],
    18: [{ time: '06:00', title: 'Pipeline velocity · W23 auto-run',      kind: 'ops',  tag: 'WK'  }],
    19: [{ time: '18:00', title: 'Daily ops digest · #leadership',        kind: 'ops',  tag: 'RPT' }],
    20: [{ time: '10:00', title: 'ICP conversion deep-dive · ad-hoc',    kind: 'task', tag: 'ADH' }],
  },
  research: {
    16: [{ time: '05:00', title: 'Daily news + signal scan',              kind: 'ops',  tag: 'SCN' },
         { time: '13:18', title: 'Competitor pricing brief · drafted',    kind: 'task', tag: 'BR'  }],
    17: [{ time: '10:00', title: 'Q3 strategic memo · v2 review',         kind: 'task', tag: 'MEM' }],
    19: [{ time: '10:00', title: 'Customer interview synthesis · 14 transcripts', kind: 'ops', tag: 'SYN' }],
    22: [{ time: '10:00', title: 'Biweekly competitor scan',              kind: 'ops',  tag: 'SCN' }],
  },
  outreach: {
    16: [{ time: '07:00', title: 'Outbound batch · Series A list',        kind: 'ops',     tag: 'OUT' },
         { time: '14:00', title: 'Maya Chen · follow-up step 2',          kind: 'task',    tag: 'EM'  }],
    17: [{ time: '07:00', title: 'Conference attendee batch · 38 contacts', kind: 'ops',   tag: 'OUT' }],
    18: [{ time: '11:00', title: 'David Osei · demo booked',              kind: 'meeting', tag: 'MTG' }],
    20: [{ time: '07:00', title: 'Re-engagement batch · cooled leads',    kind: 'ops',     tag: 'OUT' }],
    22: [{ time: '09:00', title: 'Weekly sequence review',                kind: 'ops',     tag: 'OPS' }],
  },
}

const FIRST_DAY_OFFSET = 4 // May 2026: 1st is a Friday (Mon=0)
const DAYS_IN_MONTH    = 31
const TODAY            = 16
const TOTAL_CELLS      = Math.ceil((FIRST_DAY_OFFSET + DAYS_IN_MONTH) / 7) * 7
const WEEK_DAYS        = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildCells(): (number | null)[] {
  const cells: (number | null)[] = []
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const day = i - FIRST_DAY_OFFSET + 1
    cells.push(day >= 1 && day <= DAYS_IN_MONTH ? day : null)
  }
  return cells
}

const CELLS = buildCells()

function dayLabel(day: number) {
  return new Date(2026, 4, day).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

function dayOfWeek(day: number) {
  return new Date(2026, 4, day).toLocaleDateString('en-US', { weekday: 'short' })
}

export function CalendarTab({ agent }: { agent: AgentConfig }) {
  const [selectedDay, setSelectedDay] = useState(TODAY)
  const events: AgentCalendar = CALENDARS[agent.slug] ?? {}
  const selectedEvents = events[selectedDay] ?? []

  const upcomingDays = Object.keys(events)
    .map(Number)
    .filter(d => d >= selectedDay)
    .sort((a, b) => a - b)

  const selectedLabel =
    selectedDay === TODAY ? 'Today' : selectedDay > TODAY ? 'Upcoming' : 'Past'

  return (
    <div className="hub-body fade-in">
      <div className="cal-layout">
        <div className="cal-full">
          <div className="cal-full-head">
            <div className="cal-month-nav">
              <button className="icon-btn">‹</button>
              <div className="cal-month-title">May 2026</div>
              <button className="icon-btn">›</button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="chip active">Month</button>
              <button className="chip">Week</button>
              <button className="chip">Agenda</button>
            </div>
          </div>

          <div className="cal-weekheader">
            {WEEK_DAYS.map(d => <div key={d}>{d}</div>)}
          </div>

          <div className="cal-full-grid">
            {CELLS.map((day, i) => {
              if (day === null) return <div className="cal-day outside" key={i} />
              const dayEvents = events[day] ?? []
              const visible = dayEvents.slice(0, 3)
              const more    = dayEvents.length - visible.length
              return (
                <div
                  key={i}
                  className={
                    'cal-day' +
                    (day === TODAY        ? ' today'    : '') +
                    (day === selectedDay  ? ' selected' : '')
                  }
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="cal-day-num">{day}</div>
                  {visible.map((e, j) => (
                    <div className={`cal-event ${e.kind}`} key={j} title={`${e.time} · ${e.title}`}>
                      {e.title}
                    </div>
                  ))}
                  {more > 0 && <div className="cal-event-more">+{more} more</div>}
                </div>
              )
            })}
          </div>
        </div>

        <aside className="day-detail">
          <div className="day-detail-head">
            <div className="day-detail-date">{selectedLabel}</div>
            <div className="day-detail-title">{dayLabel(selectedDay)}</div>
          </div>

          {selectedEvents.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>
              Nothing scheduled for {agent.name} on this day.
            </div>
          ) : (
            <div>
              {selectedEvents.map((e, i) => (
                <div className="day-event" key={i}>
                  <div className="day-event-time">{e.time}</div>
                  <div className="day-event-body">
                    <div className="day-event-title">{e.title}</div>
                    <span className="day-event-tag">{e.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line-1)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Upcoming this week
            </div>
            {upcomingDays.slice(0, 4).map(d => {
              const ev = events[d]!
              return (
                <div
                  key={d}
                  className="day-event"
                  onClick={() => setSelectedDay(d)}
                  style={{ cursor: 'pointer', padding: '8px 0' }}
                >
                  <div className="day-event-time">{dayOfWeek(d)} {d}</div>
                  <div className="day-event-body">
                    <div className="day-event-title">{ev[0].title}</div>
                    {ev.length > 1 && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>
                        +{ev.length - 1} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
