'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { theme } from '@/config/theme';

type Report = {
  id: number;
  date: string;
  title: string;
  data_json: string;
  created_at: string;
};

type TabId = 'summary' | 'themes' | 'portfolio' | 'recommendations';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [loading, setLoading] = useState(true);

  const reportId = params.id;

  useEffect(() => {
    fetch(`/api/reports/${reportId}`)
      .then(res => res.json())
      .then(data => {
        if (data.report) {
          setReport(data.report);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reportId]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'themes', label: 'Theme Analysis' },
    { id: 'portfolio', label: 'Portfolio Breakdown' },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  if (loading) {
    return <div style={{ padding: '24px', color: theme.colors.text.secondary }}>Loading...</div>;
  }

  if (!report) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ color: theme.colors.text.secondary }}>Report not found</div>
      </div>
    );
  }

  const data = report.data_json ? JSON.parse(report.data_json) : {};

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return <ExecutiveSummary data={data} />;
      case 'themes':
        return <ThemeAnalysis data={data} />;
      case 'portfolio':
        return <PortfolioBreakdown data={data} />;
      case 'recommendations':
        return <Recommendations data={data} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
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
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: theme.colors.text.primary }}>
          {report.title}
        </h1>
        <p style={{ margin: '8px 0 0', color: theme.colors.text.secondary, fontSize: '14px' }}>
          {new Date(report.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Print button */}
      <div style={{ marginBottom: '24px', textAlign: 'right' }}>
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: theme.colors.background.tertiary,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border}`,
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        borderBottom: `1px solid ${theme.colors.border}`,
        marginBottom: '24px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${theme.colors.accent.primary}` : '2px solid transparent',
              color: activeTab === tab.id ? theme.colors.accent.primary : theme.colors.text.secondary,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 150ms ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="report-content">
        {renderContent()}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .sidebar, .mobile-menu-btn, button {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .report-content {
            font-size: 12pt;
            line-height: 1.5;
          }
        }
      `}</style>
    </div>
  );
}

// Tab Components
function ExecutiveSummary({ data }: { data: any }) {
  const portfolio = data.portfolio || {};
  const themes = data.themes || {};
  
  const totalValue = portfolio.total_portfolio?.total_market_value || 0;
  const holdings = portfolio.total_portfolio?.total_holdings || 0;
  const themeCount = themes.summary?.total_themes || 0;
  const topTheme = themes.summary?.top_theme || 'N/A';

  return (
    <div className="report-content" style={{ color: theme.colors.text.primary }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Executive Summary</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: theme.colors.background.secondary, padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '4px' }}>PORTFOLIO VALUE</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>${totalValue.toLocaleString()}</div>
        </div>
        <div style={{ backgroundColor: theme.colors.background.secondary, padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '4px' }}>HOLDINGS</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{holdings}</div>
        </div>
        <div style={{ backgroundColor: theme.colors.background.secondary, padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '4px' }}>ACTIVE THEMES</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{themeCount}</div>
        </div>
      </div>

      <div style={{ backgroundColor: theme.colors.background.secondary, padding: '20px', borderRadius: '8px' }}>
        <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginBottom: '8px' }}>TOP THEME</div>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>{topTheme}</div>
      </div>
    </div>
  );
}

function ThemeAnalysis({ data }: { data: any }) {
  const themes = data.themes?.themes || [];
  
  return (
    <div className="report-content" style={{ color: theme.colors.text.primary }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Theme Analysis</h2>
      
      {themes.length === 0 ? (
        <div style={{ color: theme.colors.text.secondary }}>No theme data available</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {themes.map((themeItem: any, idx: number) => (
            <div key={idx} style={{ 
              backgroundColor: theme.colors.background.secondary, 
              padding: '16px 20px', 
              borderRadius: '8px',
              borderLeft: `4px solid ${getTierColor(themeItem.tier)}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>{themeItem.name}</span>
                <span style={{ 
                  fontSize: '12px', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  backgroundColor: getTierColor(themeItem.tier) + '20',
                  color: getTierColor(themeItem.tier),
                }}>
                  {themeItem.tier}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.text.secondary, marginBottom: '8px' }}>
                {themeItem.thesis}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.text.tertiary }}>
                Score: {themeItem.score}/5 | Companies: {themeItem.companies_mentioned?.join(', ') || 'None'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioBreakdown({ data }: { data: any }) {
  const portfolio = data.portfolio || {};
  const byAccount = portfolio.by_account || {};
  const byTheme = portfolio.by_theme || {};
  
  return (
    <div className="report-content" style={{ color: theme.colors.text.primary }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Portfolio Breakdown</h2>
      
      <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text.secondary, marginBottom: '12px' }}>BY ACCOUNT</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {Object.entries(byAccount).map(([name, info]: [string, any]) => (
          <div key={name} style={{ backgroundColor: theme.colors.background.secondary, padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>{name}</div>
            <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>{info.type}</div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px' }}>
              ${(info.market_value || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: theme.colors.text.tertiary }}>
              {info.holdings_count} holdings
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recommendations({ data }: { data: any }) {
  const recommendations = data.recommendations || [];
  
  return (
    <div className="report-content" style={{ color: theme.colors.text.primary }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Recommendations</h2>
      
      {recommendations.length === 0 ? (
        <div style={{ color: theme.colors.text.secondary }}>
          <p>No specific recommendations at this time.</p>
          <p>Review the Theme Analysis and Portfolio Breakdown tabs for insights.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} style={{ 
              backgroundColor: theme.colors.background.secondary, 
              padding: '16px 20px', 
              borderRadius: '8px',
              borderLeft: `4px solid ${getPriorityColor(rec.priority)}`,
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{rec.title}</div>
              <div style={{ fontSize: '13px', color: theme.colors.text.secondary }}>{rec.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getTierColor(tier: string) {
  switch (tier) {
    case 'Research': return '#3B82F6';
    case 'Watch': return '#F59E0B';
    case 'Active': return '#10B981';
    default: return '#6B7280';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#6B7280';
  }
}
