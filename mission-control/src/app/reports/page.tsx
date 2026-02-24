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

function ImportModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [jsonContent, setJsonContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    
    try {
      let dataJson = {};
      if (jsonContent.trim()) {
        try {
          dataJson = JSON.parse(jsonContent);
        } catch {
          // If not valid JSON, treat as raw text
          dataJson = { raw_content: jsonContent };
        }
      }
      
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          data_json: dataJson,
        }),
      });
      
      if (res.ok) {
        onClose();
        window.location.reload();
      } else {
        setError('Failed to save report');
      }
    } catch (e) {
      setError('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
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
          width: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid var(--border-color)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: 'var(--text-primary)', marginTop: 0, marginBottom: '20px' }}>
          Import Report
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
            Report Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Weekly Investment Briefing - Feb 23"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
            Report Data (JSON) - Optional
          </label>
          <textarea
            value={jsonContent}
            onChange={e => setJsonContent(e.target.value)}
            placeholder='{"portfolio": {...}, "themes": {...}}'
            rows={8}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontFamily: 'monospace',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            Paste JSON for structured data, or leave empty for a blank report.
          </div>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: theme.colors.accent.primary,
              color: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Import Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            📥 Import Report
          </button>
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
          No reports yet. Generate or import your first report.
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
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = theme.colors.accent.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = theme.colors.border}
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

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
