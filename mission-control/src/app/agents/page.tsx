'use client';

import { useMemo, useState } from 'react';
import { AGENTS } from '@/data/agents';
import { Agent, AgentCategory, AgentPriority } from '@/types/agents';

// ── colour maps ───────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<AgentPriority, string> = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#6b7280',
};

const CATEGORY_COLOR: Record<AgentCategory, string> = {
  hub: '#8b5cf6',
  finance: '#22c55e',
  revenue: '#3b82f6',
  tech: '#06b6d4',
  lifestyle: '#f97316',
  other: '#6b7280',
};

// ── tiny inline components ────────────────────────────────────────────────────

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: status === 'online' ? '#22c55e' : '#6b7280',
          display: 'inline-block',
        }}
      />
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
        {status}
      </span>
    </span>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const PRIORITY_RANK: Record<AgentPriority, number> = { high: 0, medium: 1, low: 2 };

type SortKey = keyof Agent;

export default function AgentsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortAsc, setSortAsc] = useState(true);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(AGENTS.map((a) => a.category)))],
    []
  );

  const sorted = useMemo(() => {
    let list = categoryFilter === 'all' ? AGENTS : AGENTS.filter((a) => a.category === categoryFilter);

    list = [...list].sort((a, b) => {
      if (sortKey === 'priority') {
        const diff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        return sortAsc ? diff : -diff;
      }
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [categoryFilter, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((p) => !p);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

  const COLS: { key: SortKey; label: string; width?: string }[] = [
    { key: 'id',            label: 'ID',            width: '100px' },
    { key: 'human_name',    label: 'Name',          width: '110px' },
    { key: 'role',          label: 'Role'                          },
    { key: 'model',         label: 'Model',         width: '100px' },
    { key: 'category',      label: 'Category',      width: '110px' },
    { key: 'priority',      label: 'Priority',      width: '100px' },
    { key: 'status',        label: 'Status',        width: '110px' },
    { key: 'last_active_at',label: 'Last Active',   width: '130px' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            🤖 Agent Roster
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            {AGENTS.length} agents registered · data is hard-coded until OpenClaw API is wired up
          </p>
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '4px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                textTransform: 'capitalize',
                borderColor:
                  categoryFilter === cat
                    ? (cat === 'all' ? '#8b5cf6' : CATEGORY_COLOR[cat as AgentCategory])
                    : 'var(--border-color)',
                backgroundColor:
                  categoryFilter === cat
                    ? (cat === 'all' ? '#8b5cf622' : `${CATEGORY_COLOR[cat as AgentCategory]}22`)
                    : 'transparent',
                color:
                  categoryFilter === cat
                    ? (cat === 'all' ? '#8b5cf6' : CATEGORY_COLOR[cat as AgentCategory])
                    : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                {COLS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: sortKey === col.key ? '#8b5cf6' : 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: col.width,
                    }}
                  >
                    {col.label}{sortIndicator(col.key)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sorted.map((agent, idx) => {
                const isHigh = agent.priority === 'high';
                return (
                  <tr
                    key={agent.id}
                    style={{
                      borderBottom: idx < sorted.length - 1 ? '1px solid var(--border-color)' : 'none',
                      backgroundColor: isHigh ? '#ef444408' : 'transparent',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isHigh
                        ? '#ef444414'
                        : 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isHigh
                        ? '#ef444408'
                        : 'transparent';
                    }}
                  >
                    {/* ID */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 13,
                          color: isHigh ? '#ef4444' : 'var(--text-secondary)',
                          fontWeight: isHigh ? 700 : 400,
                        }}
                      >
                        {agent.id}
                      </span>
                    </td>

                    {/* Human name */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {agent.human_name}
                      </span>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {agent.role}
                      </span>
                    </td>

                    {/* Model */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: '#8b5cf6',
                          backgroundColor: '#8b5cf610',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {agent.model}
                      </span>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '12px 16px' }}>
                      <Pill label={agent.category} color={CATEGORY_COLOR[agent.category]} />
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '12px 16px' }}>
                      <Pill label={agent.priority} color={PRIORITY_COLOR[agent.priority]} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      <StatusDot status={agent.status} />
                    </td>

                    {/* Last active */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                        {agent.last_active_at
                          ? new Date(agent.last_active_at).toLocaleString()
                          : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'right' }}>
        Sorted by: <strong style={{ color: 'var(--text-secondary)' }}>{sortKey}</strong> ·
        click any column header to re-sort
      </p>
    </div>
  );
}
