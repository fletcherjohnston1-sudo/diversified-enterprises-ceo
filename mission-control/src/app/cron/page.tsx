'use client';

import { useEffect, useState } from 'react';

interface CronJob {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr?: string;
    everyMs?: number;
    tz?: string;
  };
  nextRunAtMs: number;
  lastRunAtMs: number;
  lastStatus: string;
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    // Parse cron expression: min hour day month weekday @ timezone
    const parts = schedule.expr.split(/\s+/);
    if (parts.length >= 5) {
      const [min, hour, day, month, weekday] = parts;
      const tz = schedule.tz ? schedule.tz.replace(/_/g, ' ') : '';
      
      // Build human-readable format
      const time = `${hour}:${min.padStart(2, '0')}`;
      
      // Day of week
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNames = weekday?.split(',').map(d => {
        if (d.includes('-')) {
          const [start, end] = d.split('-').map(Number);
          return `${days[start]}-${days[end]}`;
        }
        return days[parseInt(d)] || d;
      }).join(', ');
      
      // Monthly
      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = month && month !== '*' ? months[parseInt(month)] : null;
      
      let readable = '';
      
      // Monthly (specific day of month)
      if (day !== '*' && day !== '0' && day !== undefined) {
        const ordinal = ['st', 'nd', 'rd', 'th'];
        const getOrdinal = (n: number) => ordinal[(n - 1) % 10] || 'th';
        const dayStr = dayNames && dayNames !== '*' ? dayNames : `the ${day}${getOrdinal(parseInt(day))}`;
        readable = monthName 
          ? `${monthName} ${dayStr} at ${time}`
          : `Monthly on the ${day}${getOrdinal(parseInt(day))} at ${time}`;
      }
      // Weekly with weekday specified
      else if (weekday && weekday !== '*') {
        readable = `Every ${dayNames} at ${time}`;
      }
      // Daily
      else {
        readable = `Daily at ${time}`;
      }
      
      return readable;
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

function getStatusColor(status: string | undefined, enabled: boolean): string {
  if (!enabled) return 'var(--text-tertiary)';
  if (status === 'ok') return '#22c55e';
  if (status === 'error') return '#ef4444';
  return 'var(--text-secondary)';
}

export default function CronPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <h1 style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>Cron Jobs</h1>
      
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
            {jobs.map((job) => (
              <tr 
                key={job.id} 
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  opacity: job.enabled ? 1 : 0.5,
                }}
              >
                <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                  {job.name}
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
    </div>
  );
}
