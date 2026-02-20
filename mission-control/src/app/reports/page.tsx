'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { theme } from '@/config/theme';

type Report = {
  id: number;
  date: string;
  title: string;
  created_at: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
          Reports
        </h1>
        <Link href="/reports/new" style={{
          backgroundColor: theme.colors.accent.primary,
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          + Generate Report
        </Link>
      </div>

      {loading ? (
        <div style={{ color: theme.colors.text.secondary }}>Loading...</div>
      ) : reports.length === 0 ? (
        <div style={{ 
          color: theme.colors.text.secondary, 
          padding: '40px',
          textAlign: 'center',
          backgroundColor: theme.colors.background.secondary,
          borderRadius: '8px',
        }}>
          No reports yet. Generate your first investment report.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map(report => (
            <Link 
              key={report.id}
              href={`/reports/${report.id}`}
              style={{
                display: 'block',
                padding: '16px 20px',
                backgroundColor: theme.colors.background.secondary,
                borderRadius: '8px',
                textDecoration: 'none',
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: theme.colors.text.primary,
                    marginBottom: '4px',
                  }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: '13px', color: theme.colors.text.secondary }}>
                    {new Date(report.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: theme.colors.text.tertiary,
                }}>
                  Created {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
