'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { theme } from '@/config/theme';

type PortfolioData = any;
type ThemeData = any;
type FinanceData = any;

export default function NewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [themes, setThemes] = useState<ThemeData | null>(null);
  const [finance, setFinance] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load data from shared investment data
    Promise.all([
      fetch('/api/investments/portfolio').catch(() => null),
      fetch('/api/investments/themes').catch(() => null),
      fetch('/api/finance/summary').catch(() => null),
    ])
      .then(([pRes, tRes, fRes]) => {
        if (pRes?.ok) pRes.json().then(setPortfolio);
        if (tRes?.ok) tRes.json().then(setThemes);
        if (fRes?.ok) fRes.json().then(setFinance);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load investment data');
        setLoading(false);
      });
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      // Prepare report data
      const reportData = {
        portfolio,
        themes,
        finance,
        generatedAt: new Date().toISOString(),
      };

      // Save to database
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          title: `Investment Briefing - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
          data_json: reportData,
        }),
      });

      const result = await res.json();
      
      if (result.id) {
        router.push(`/reports/${result.id}`);
      } else {
        setError('Failed to save report');
      }
    } catch {
      setError('Failed to generate report');
    }
    
    setGenerating(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', color: theme.colors.text.secondary }}>
        Loading investment data...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <button
        onClick={() => router.push('/reports')}
        style={{
          background: 'none',
          border: 'none',
          color: theme.colors.accent.primary,
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '12px',
          padding: 0,
        }}
      >
        ← Back to Reports
      </button>

      <h1 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '600', color: theme.colors.text.primary }}>
        Generate Investment Report
      </h1>

      {error && (
        <div style={{ 
          backgroundColor: '#EF444420', 
          color: '#EF4444', 
          padding: '12px 16px', 
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        backgroundColor: theme.colors.background.secondary, 
        padding: '24px', 
        borderRadius: '8px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          Data Sources
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: portfolio ? '#10B981' : '#EF4444' 
            }} />
            <span>Portfolio Data: {portfolio ? 'Loaded' : 'Not available'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: themes ? '#10B981' : '#EF4444' 
            }} />
            <span>Theme Data: {themes ? 'Loaded' : 'Not available'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: finance ? '#10B981' : '#EF4444' 
            }} />
            <span>Finance Data: {finance ? 'Loaded' : 'Not available'}</span>
          </div>
        </div>
      </div>

      <button
        onClick={generateReport}
        disabled={generating || !portfolio}
        style={{
          backgroundColor: generating || !portfolio ? theme.colors.background.tertiary : theme.colors.accent.primary,
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '6px',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500',
          cursor: generating || !portfolio ? 'not-allowed' : 'pointer',
          opacity: generating || !portfolio ? 0.6 : 1,
        }}
      >
        {generating ? 'Generating Report...' : 'Generate Report'}
      </button>
    </div>
  );
}
