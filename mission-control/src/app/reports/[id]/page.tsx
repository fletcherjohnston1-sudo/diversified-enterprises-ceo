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

type TabId = 'summary' | 'themes' | 'portfolio' | 'recommendations' | 'raw';

function detectReportType(data: any): 'investment' | 'generic' {
  // Check if it's an investment report (has portfolio or themes data)
  if (data.portfolio || data.themes || data.recommendations) {
    return 'investment';
  }
  return 'generic';
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'investment' | 'generic'>('investment');

  const reportId = params.id;

  useEffect(() => {
    fetch(`/api/reports/${reportId}`)
      .then(res => res.json())
      .then(data => {
        if (data.report) {
          setReport(data.report);
          const dataContent = data.report.data_json ? JSON.parse(data.report.data_json) : {};
          setReportType(detectReportType(dataContent));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [reportId]);

  const investmentTabs: { id: TabId; label: string }[] = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'themes', label: 'Theme Analysis' },
    { id: 'portfolio', label: 'Portfolio Breakdown' },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  const genericTabs: { id: TabId; label: string }[] = [
    { id: 'raw', label: 'Report Content' },
  ];

  const tabs = reportType === 'investment' ? investmentTabs : genericTabs;

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
    if (reportType === 'generic' || activeTab === 'raw') {
      return <RawReportView data={data} />;
    }
    
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
        overflowX: 'auto',
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
              whiteSpace: 'nowrap',
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

// Generic Raw Report View - visually appealing
function RawReportView({ data }: { data: any }) {
  const [viewMode, setViewMode] = useState<'pretty' | 'json'>('pretty');

  // Try to render as pretty markdown-like content
  const renderPretty = () => {
    // If it's a string, render as-is
    if (typeof data === 'string') {
      return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{data}</pre>;
    }

    // If it has raw_content, render that
    if (data.raw_content) {
      return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{data.raw_content}</pre>;
    }

    // Otherwise render the JSON in a pretty way
    const jsonStr = JSON.stringify(data, null, 2);
    
    // Try to detect and format sections
    const lines = jsonStr.split('\n');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: theme.colors.accent.primary,
              marginBottom: '8px',
              textTransform: 'capitalize',
            }}>
              {key.replace(/_/g, ' ')}
            </div>
            <div style={{ 
              backgroundColor: theme.colors.background.secondary,
              padding: '16px',
              borderRadius: '8px',
              fontSize: '13px',
              color: theme.colors.text.primary,
              whiteSpace: 'pre-wrap',
              maxHeight: '400px',
              overflow: 'auto',
            }}>
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* View Mode Toggle */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setViewMode('pretty')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'pretty' ? theme.colors.accent.primary : theme.colors.background.tertiary,
            color: viewMode === 'pretty' ? '#fff' : theme.colors.text.secondary,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          📄 Formatted
        </button>
        <button
          onClick={() => setViewMode('json')}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: viewMode === 'json' ? theme.colors.accent.primary : theme.colors.background.tertiary,
            color: viewMode === 'json' ? '#fff' : theme.colors.text.secondary,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          {'{}'} JSON
        </button>
      </div>

      {/* Content */}
      <div style={{ 
        backgroundColor: theme.colors.background.secondary,
        borderRadius: '12px',
        padding: '24px',
        border: `1px solid ${theme.colors.border}`,
      }}>
        {viewMode === 'pretty' ? renderPretty() : (
          <pre style={{ 
            margin: 0, 
            fontSize: '12px', 
            fontFamily: 'monospace',
            color: theme.colors.text.primary,
            overflow: 'auto',
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// Tab Components (existing)
function ExecutiveSummary({ data }: { data: any }) {
  const portfolio = data.portfolio || {};
  const themes = data.themes || {};
  
  // Handle both old format (total_portfolio) and new format (top-level)
  const totalValue = portfolio.total_portfolio?.total_market_value || portfolio.total_value || 0;
  const holdings = portfolio.total_portfolio?.total_holdings || portfolio.num_holdings || 0;
  const themeCount = themes.summary?.total_themes || (Array.isArray(themes) ? themes.length : 0);
  const topTheme = themes.summary?.top_theme || (Array.isArray(themes) && themes[0]?.name) || 'N/A';

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
  // Handle both formats: data.themes.themes (old) or data.themes (array directly)
  const themesArray = data.themes?.themes || data.themes || [];
  
  return (
    <div className="report-content" style={{ color: theme.colors.text.primary }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Theme Analysis</h2>
      
      {themesArray.length === 0 ? (
        <div style={{ color: theme.colors.text.secondary }}>No theme data available</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {themesArray.map((themeItem: any, idx: number) => (
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
  const topHoldings = portfolio.top_5_holdings || [];
  
  return (
    <div className="report-content" style={{ color: theme.colors.text.primary }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Portfolio Breakdown</h2>
      
      {/* By Account */}
      {Object.keys(byAccount).length > 0 && (
        <>
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
        </>
      )}

      {/* By Theme */}
      {Object.keys(byTheme).length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text.secondary, marginBottom: '12px' }}>BY THEME</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {Object.entries(byTheme).map(([name, value]: [string, any]) => (
              <div key={name} style={{ backgroundColor: theme.colors.background.secondary, padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{name.replace(/_/g, ' ')}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px' }}>
                  ${(value || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Top 5 Holdings */}
      {topHoldings.length > 0 && (
        <>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.colors.text.secondary, marginBottom: '12px' }}>TOP HOLDINGS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '8px', marginBottom: '24px' }}>
            {topHoldings.map((h: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: theme.colors.background.secondary, padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{h.symbol}</span>
                <span>${(h.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
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
