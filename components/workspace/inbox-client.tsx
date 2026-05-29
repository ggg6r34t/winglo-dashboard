'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import type { InboxCounts, InboxFilter, InboxItem } from '@/types'
import { PageAgentGlyph } from '@/components/workspace/page-agent-glyph'

interface InboxClientActions {
  markRead: (id: string) => Promise<void>
  approve: (id: string) => Promise<void>
  archive: (id: string) => Promise<void>
  resolve: (id: string) => Promise<void>
  reply: (id: string, body: string) => Promise<void>
}

interface InboxClientProps {
  initialItems: InboxItem[]
  counts: InboxCounts
  actions: InboxClientActions
}

const filters: Array<{ id: InboxFilter; label: string; countKey: keyof InboxCounts }> = [
  { id: 'all', label: 'All', countKey: 'all' },
  { id: 'unread', label: 'Unread', countKey: 'unread' },
  { id: 'decisions', label: 'Decisions', countKey: 'decisions' },
  { id: 'reports', label: 'Reports', countKey: 'reports' },
  { id: 'operational', label: 'Operational', countKey: 'operational' },
]

export function InboxClient({ initialItems, counts, actions }: InboxClientProps) {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<InboxFilter>('all')
  const [activeId, setActiveId] = useState(initialItems[0]?.id ?? null)
  const [replyNote, setReplyNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (item.archived_at) return false
      if (filter === 'unread') return !item.read_at
      if (filter === 'decisions') return item.category === 'decision'
      if (filter === 'reports') return item.category === 'report'
      if (filter === 'operational') return item.category === 'operational'
      return true
    })
  }, [filter, items])

  const active = items.find(item => item.id === activeId) ?? filtered[0] ?? null

  function selectItem(item: InboxItem) {
    setActiveId(item.id)
    if (!item.read_at) {
      setItems(current => current.map(candidate => (
        candidate.id === item.id ? { ...candidate, read_at: new Date().toISOString() } : candidate
      )))
      void actions.markRead(item.id).catch(() => undefined)
    }
  }

  function runAction(operation: () => Promise<void>, optimistic?: () => void) {
    setError(null)
    startTransition(async () => {
      try {
        optimistic?.()
        await operation()
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : 'Action failed. Please try again.')
      }
    })
  }

  function approveActive() {
    if (!active) return
    runAction(
      () => actions.approve(active.id),
      () => setItems(current => current.map(item => (
        item.id === active.id ? { ...item, status: 'resolved', requires_action: false, resolved_at: new Date().toISOString() } : item
      ))),
    )
  }

  function resolveActive() {
    if (!active) return
    runAction(
      () => actions.resolve(active.id),
      () => setItems(current => current.map(item => (
        item.id === active.id ? { ...item, status: 'resolved', requires_action: false, resolved_at: new Date().toISOString() } : item
      ))),
    )
  }

  function archiveActive() {
    if (!active) return
    runAction(
      () => actions.archive(active.id),
      () => setItems(current => current.map(item => (
        item.id === active.id ? { ...item, archived_at: new Date().toISOString() } : item
      ))),
    )
  }

  function replyActive() {
    if (!active || !replyNote.trim()) return
    const note = replyNote.trim()
    runAction(
      async () => {
        await actions.reply(active.id, note)
        setReplyNote('')
      },
      () => setItems(current => current.map(item => (
        item.id === active.id
          ? {
              ...item,
              comments: [
                ...item.comments,
                {
                  id: `optimistic-${Date.now()}`,
                  organization_id: item.organization_id,
                  inbox_item_id: item.id,
                  author_type: 'user',
                  author_id: 'current-user',
                  agent_slug: null,
                  body: note,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : item
      ))),
    )
  }

  return (
    <div className="inbox fade-in">
      <div className="inbox-list">
        <div className="inbox-filters">
          {filters.map(item => (
            <button
              key={item.id}
              type="button"
              className={`chip${filter === item.id ? ' active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span className="count">{counts[item.countKey]}</span>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="tab-empty">No inbox items match this filter.</div>
        )}
        {filtered.map(item => (
          <button
            type="button"
            key={item.id}
            className={`inbox-item${item.id === active?.id ? ' active' : ''}${!item.read_at ? ' unread' : ''}`}
            onClick={() => selectItem(item)}
          >
            {item.agent_slug ? <PageAgentGlyph agentId={item.agent_slug} size={26} /> : <span />}
            <span style={{ minWidth: 0, textAlign: 'left' }}>
              <span className="inbox-meta-row">
                <span className="inbox-from">{item.agent_name ?? item.actor_type}</span>
                <span className="inbox-time">{formatRelative(item.created_at)}</span>
              </span>
              <span className="inbox-subject">{item.title}</span>
              <span className="inbox-preview">{item.preview}</span>
              <span className="inbox-tags">
                {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </span>
            </span>
          </button>
        ))}
      </div>

      {active ? (
        <div className="inbox-detail fade-in" key={active.id}>
          <div className="detail-head">
            <div className="detail-from">
              {active.agent_slug ? <PageAgentGlyph agentId={active.agent_slug} size={34} /> : null}
              <div>
                <div style={{ fontSize: 13, color: 'var(--fg-0)', fontWeight: 500 }}>{active.agent_name ?? active.actor_type}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {active.agent_role ?? active.category}
                </div>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
              {formatRelative(active.created_at)} ago / {active.id.toUpperCase()}
            </div>
          </div>

          <h1 className="detail-subject">{active.title}</h1>
          <div className="detail-body">
            {active.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}

            {active.artifacts.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8 }}>
                  Attached artifacts
                </div>
                {active.artifacts.map(artifact => (
                  <div className="artifact" key={artifact.id}>
                    <div className="artifact-icon">{artifact.icon}</div>
                    <div>
                      <div className="artifact-name">{artifact.name}</div>
                      <div className="artifact-meta">{artifact.meta}</div>
                    </div>
                    <Link className="btn" href={artifact.open_href}>Open</Link>
                  </div>
                ))}
              </div>
            )}

            {active.comments.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8 }}>
                  Notes
                </div>
                {active.comments.map(comment => (
                  <p key={comment.id} style={{ borderLeft: '2px solid var(--line-2)', paddingLeft: 10 }}>{comment.body}</p>
                ))}
              </div>
            )}
          </div>

          {error && <div className="tab-empty" style={{ color: 'var(--bad)' }}>{error}</div>}

          <div className="detail-actions">
            {active.action_type === 'approval' && active.status === 'open' && (
              <button type="button" className="btn primary" disabled={isPending} onClick={approveActive}>Approve &amp; continue</button>
            )}
            <label style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }} htmlFor="inbox-reply-note">Reply note</label>
            <input
              id="inbox-reply-note"
              value={replyNote}
              onChange={event => setReplyNote(event.target.value)}
              placeholder="Add internal note"
              style={{ minWidth: 180, background: 'var(--bg-1)', color: 'var(--fg-0)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-sm)', padding: '0 10px', fontSize: 12 }}
            />
            <button type="button" className="btn" disabled={isPending || !replyNote.trim()} onClick={replyActive}>Reply with note</button>
            <button type="button" className="btn" disabled={isPending || active.status === 'resolved'} onClick={resolveActive}>Mark resolved</button>
            <button type="button" className="btn" disabled={isPending} style={{ marginLeft: 'auto', color: 'var(--fg-3)' }} onClick={archiveActive}>Archive</button>
          </div>
        </div>
      ) : (
        <div className="inbox-detail">
          <div className="tab-empty">Inbox is clear.</div>
        </div>
      )}
    </div>
  )
}

function formatRelative(value: string) {
  const diffMs = Math.max(0, Date.now() - new Date(value).getTime())
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))}m`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h`
  return `${Math.floor(diffMs / day)}d`
}
