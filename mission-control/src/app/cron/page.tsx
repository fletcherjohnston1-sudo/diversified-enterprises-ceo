'use client';

import { useEffect, useState } from 'react';

interface CronJobPayload {
  kind: string;
  message?: string;
  model?: string;
  timeoutSeconds?: number;
}

interface CronJobDelivery {
  mode: string;
  channel?: string;
  to?: string;
}

interface CronJob {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  enabled: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  schedule: {
    kind: string;
    expr?: string;
    everyMs?: number;
    tz?: string;
  };
  sessionTarget: string;
  wakeMode: string;
  payload: CronJobPayload;
  delivery: CronJobDelivery;
  nextRunAtMs: number;
  lastRunAtMs: number;
  lastStatus: string;
  lastDurationMs?: number;
  consecutiveErrors?: number;
}

interface CronRun {
  ts: number;
  jobId: string;
  action: string;
  status: string;
  summary?: string;
  runAtMs: number;
  durationMs: number;
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    const parts = schedule.expr.split(/\s+/);
    if (parts.length >= 5) {
      const [min, hour, day, month, weekday] = parts;
      const time = `${hour}:${min.padStart(2, '0')}`;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNames = weekday?.split(',').map(d => {
        if (d.includes('-')) {
          const [start, end] = d.split('-').map(Number);
          return `${days[start]}-${days[end]}`;
        }
        return days[parseInt(d)] || d;
      }).join(', ');
      
      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = month && month !== '*' ? months[parseInt(month)] : null;
      
      if (day !== '*' && day !== '0' && day !== undefined) {
        const ordinal = ['st', 'nd', 'rd', 'th'];
        const getOrdinal = (n: number) => ordinal[(n - 1) % 10] || 'th';
        const dayStr = dayNames && dayNames !== '*' ? dayNames : `the ${day}${getOrdinal(parseInt(day))}`;
        return monthName 
          ? `${monthName} ${dayStr} at ${time}`
          : `Monthly on the ${day}${getOrdinal(parseInt(day))} at ${time}`;
      }
      else if (weekday && weekday !== '*') {
        return `Every ${dayNames} at ${time}`;
      }
      else {
        return `Daily at ${time}`;
      }
    }
    return schedule.expr;
  }
  if (schedule.kind === 'every') {
    const minutes = Math.floor((schedule.everyMs || 0) / 60000);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `Every ${minutes} min`;
  }
  return schedule.kind;
}

function formatTime(ms: number | undefined): string {
  if (!ms) return '—';
  const date = new Date(ms);
  return date.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(ms: number | undefined): string {
  if (!ms) return '—';
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function getStatusColor(status: string | undefined, enabled: boolean): string {
  if (!enabled) return 'var(--text-tertiary)';
  if (status === 'ok') return '#22c55e';
  if (status === 'error') return '#ef4444';
  return 'var(--text-secondary)';
}

type SortOption = 'name-asc' | 'name-desc' | 'nextRun-asc' | 'nextRun-desc' | 'owner-asc' | 'owner-desc';

function Modal({ job, runs, onClose }: { job: CronJob; runs: CronRun[]; onClose: () => void }) {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '700px',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid var(--border-color)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>{job.name}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1,
            }}
          >×</button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(job.lastStatus, job.enabled),
            }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {job.enabled ? (job.lastStatus || 'pending').toUpperCase() : 'DISABLED'}
            </span>
            {job.lastDurationMs && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                · {formatDuration(job.lastDurationMs)}
              </span>
            )}
            {job.consecutiveErrors !== undefined && job.consecutiveErrors > 0 && (
              <span style={{ color: '#ef4444', fontSize: '13px' }}>
                · {job.consecutiveErrors} error{job.consecutiveErrors > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Owner & Agent */}
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>OWNER</div>
            <div style={{ color: 'var(--text-primary)' }}>{job.agentName} ({job.agentId})</div>
          </div>

          {/* Schedule */}
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>SCHEDULE</div>
            <div style={{ color: 'var(--text-primary)' }}>{formatSchedule(job.schedule)}</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontFamily: 'monospace' }}>
              {job.schedule.expr} {job.schedule.tz && `(${job.schedule.tz})`}
            </div>
          </div>

          {/* Run Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>NEXT RUN</div>
              <div style={{ color: 'var(--text-primary)' }}>{formatTime(job.nextRunAtMs)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>LAST RUN</div>
              <div style={{ color: 'var(--text-primary)' }}>{formatTime(job.lastRunAtMs)}</div>
            </div>
          </div>

          {/* Delivery */}
          {job.delivery.mode !== 'none' && (
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>DELIVERY</div>
              <div style={{ color: 'var(--text-primary)' }}>
                {job.delivery.mode} 
                {job.delivery.channel && ` via ${job.delivery.channel}`}
                {job.delivery.to && ` → ${job.delivery.to}`}
              </div>
            </div>
          )}

          {/* Model */}
          {job.payload.model && (
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>MODEL</div>
              <div style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '13px' }}>
                {job.payload.model}
              </div>
            </div>
          )}

          {/* Task */}
          {job.payload.message && (
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>TASK</div>
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '13px', 
                whiteSpace: 'pre-wrap',
                maxHeight: '150px',
                overflow: 'auto',
                padding: '12px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
              }}>
                {job.payload.message}
              </div>
            </div>
          )}

          {/* Run History */}
          {runs.length > 0 && (
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '8px' }}>RECENT RUNS</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {runs.slice(0, 5).map((run, i) => (
                  <div 
                    key={i}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {formatTime(run.runAtMs)}
                    </span>
                    <span style={{ 
                      color: run.status === 'ok' ? '#22c55e' : run.status === 'error' ? '#ef4444' : 'var(--text-secondary)',
                      fontWeight: 600,
                    }}>
                      {run.status}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {formatDuration(run.durationMs)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            <span>ID: {job.id.slice(0, 8)}...</span>
            <span>Created: {formatTime(job.createdAtMs)}</span>
            <span>Updated: {formatTime(job.updatedAtMs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [runs, setRuns] = useState<CronRun[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(false);

  const sortedJobs = [...jobs].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'nextRun-asc':
        return (a.nextRunAtMs || 0) - (b.nextRunAtMs || 0);
      case 'nextRun-desc':
        return (b.nextRunAtMs || 0) - (a.nextRunAtMs || 0);
      case 'owner-asc':
        return (a.agentName || '').localeCompare(b.agentName || '');
      case 'owner-desc':
        return (b.agentName || '').localeCompare(a.agentName || '');
      default:
        return 0;
    }
  });

  const openModal = async (job: CronJob) => {
    setSelectedJob(job);
    setLoadingRuns(true);
    try {
      const res = await fetch(`/api/cron/jobs/${job.id}/runs`);
      const data = await res.json();
      if (data.success) {
        setRuns(data.data);
      }
    } catch (e) {
      console.error('Failed to load runs:', e);
      setRuns([]);
    } finally {
      setLoadingRuns(false);
    }
  };

  useEffect(() => {
    fetch('/api/cron/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setJobs(data.data);
        } else {
          setError(data.error);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>Cron Jobs</h1>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>Cron Jobs</h1>
        <div style={{ color: '#ef4444' }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Cron Jobs</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
          <option value="nextRun-asc">Sort: Next Run (Soonest)</option>
          <option value="nextRun-desc">Sort: Next Run (Latest)</option>
          <option value="owner-asc">Sort: Owner (A-Z)</option>
          <option value="owner-desc">Sort: Owner (Z-A)</option>
        </select>
      </div>
      
      <div style={{ 
        overflowX: 'auto',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ 
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
            }}>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                width: '200px',
                whiteSpace: 'nowrap',
              }}>Job</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}>Owner</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}>Schedule</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}>Next Run</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}>Last Run</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontWeight: 600,
              }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job) => (
              <tr 
                key={job.id} 
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  opacity: job.enabled ? 1 : 0.5,
                }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <span 
                    onClick={() => openModal(job)}
                    style={{ 
                      color: '#8b5cf6',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                    title="Click for details"
                  >
                    {job.name}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                  {job.agentName}
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}>
                  {formatSchedule(job.schedule)}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {formatTime(job.nextRunAtMs)}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                  {formatTime(job.lastRunAtMs)}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    color: getStatusColor(job.lastStatus, job.enabled),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(job.lastStatus, job.enabled),
                    }} />
                    {job.enabled ? (job.lastStatus || 'pending') : 'disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <Modal 
          job={selectedJob} 
          runs={loadingRuns ? [] : runs} 
          onClose={() => { setSelectedJob(null); setRuns([]); }} 
        />
      )}
    </div>
  );
}
