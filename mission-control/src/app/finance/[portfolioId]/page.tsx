'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Holding {
  ticker: string;
  company: string;
  shares: string;
  costBasis: string;
  currentValue: string;
  returnPct: string;
}

interface PortfolioData {
  id: string;
  name: string;
  color: string;
  holdings: Holding[];
}

interface ApiResponse {
  success: boolean;
  data?: PortfolioData;
  error?: string;
}

function parseMoney(str: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, '')) || 0;
}

function parsePct(str: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[+%]/g, '')) || 0;
}

function getReturnColor(pct: number): string {
  if (pct > 30) return '#10B981'; // green-500
  if (pct > 15) return '#34D399'; // green-400
  if (pct > 5) return '#6EE7B7'; // green-300
  if (pct > 0) return '#A7F3D0'; // green-200
  if (pct === 0) return '#6B7280'; // gray-500
  if (pct > -15) return '#FCA5A5'; // red-300
  if (pct > -30) return '#F87171'; // red-400
  return '#EF4444'; // red-500
}

function getReturnGradient(pct: number): string {
  const r = Math.min(255, Math.max(0, 150 + pct * 3));
  const g = Math.min(255, Math.max(0, 150 - pct * 3));
  return `rgb(${pct > 0 ? 34 : r}, ${pct > 0 ? 197 : g}, ${pct > 0 ? 94 : 71})`;
}

const TICKER_COLORS: Record<string, string> = {
  CCJ: '#3B82F6', CEG: '#8B5CF6', COPX: '#EC4899', ETN: '#14B8A6',
  GEV: '#F59E0B', PWR: '#6366F1', VRT: '#EF4444',
  BLSH: '#06B6D4', BMNR: '#84CC16', BTDR: '#F97316', CIFR: '#10B981',
  CLSK: '#8B5CF6', COIN: '#3B82F6', CORZ: '#EC4899', CRCL: '#14B8A6',
  FIGR: '#F59E0B', GLXY: '#6366F1', HOOD: '#EF4444', HUT: '#84CC16',
  IREN: '#06B6D4', MSTR: '#A855F7', WULF: '#22C55E', XYZ: '#EAB308',
  BABA: '#EF4444', BYDDY: '#F97316', BZ: '#8B5CF6', GDS: '#14B8A6',
  BIDU: '#3B82F6', BILI: '#EC4899', JD: '#10B981', NTES: '#F59E0B',
  PDD: '#6366F1', TAL: '#06B6D4', TME: '#EAB308', VIPS: '#EF4444',
};

export default function PortfolioDetailPage() {
  const params = useParams();
  const portfolioId = params.portfolioId as string;
  
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portfolioId) return;
    
    fetch(`/api/finance/${portfolioId}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setData({ success: false, error: err.message });
        setLoading(false);
      });
  }, [portfolioId]);

  if (loading) {
    return <div className="p-3 text-gray-400">Loading...</div>;
  }

  if (!data?.success || !data.data) {
    return (
      <div className="p-6">
        <p className="text-red-400 mb-4">Error: {data?.error || 'Portfolio not found'}</p>
        <Link href="/finance" className="text-blue-400 hover:underline">← Back to Finance</Link>
      </div>
    );
  }

  const { name, holdings, color } = data.data;

  // Sort by current value descending
  const sortedHoldings = [...holdings].sort((a, b) => 
    parseMoney(b.currentValue) - parseMoney(a.currentValue)
  );

  // Calculate totals
  const totalValue = sortedHoldings.reduce((sum, h) => sum + parseMoney(h.currentValue), 0);
  const totalCost = sortedHoldings.reduce((sum, h) => sum + parseMoney(h.costBasis), 0);
  const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100) : 0;

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500',
    purple: 'border-purple-500', 
    red: 'border-red-500'
  };

  // Generate allocation bar segments
  const allocationSegments = sortedHoldings.map(h => ({
    ticker: h.ticker,
    pct: totalValue > 0 ? (parseMoney(h.currentValue) / totalValue) * 100 : 0,
    color: TICKER_COLORS[h.ticker] || '#6B7280'
  })).filter(s => s.pct > 0.5); // Filter tiny slices

  return (
    <div className="p-3">
      <Link href="/finance" className="text-gray-500 hover:text-white text-sm mb-2 inline-block">
        ← Back
      </Link>
      
      {/* Header */}
      <div className={`border-l-4 ${colorClasses[color] || 'border-gray-500'} pl-3 mb-4`}>
        <h1 className="text-lg font-bold">{name}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs">
          <p><span className="text-gray-500">Invested:</span> <span className="text-gray-300">${totalCost.toLocaleString()}</span></p>
          <p><span className="text-gray-500">Current:</span> <span className="text-gray-300">${totalValue.toLocaleString()}</span></p>
          <p className={totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}>
            Return: {totalReturn.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Allocation Bar */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Allocation by Position</p>
        <div className="flex h-3 rounded overflow-hidden bg-gray-800">
          {allocationSegments.map((seg, i) => (
            <div 
              key={seg.ticker}
              style={{ 
                width: `${seg.pct}%`, 
                backgroundColor: seg.color 
              }}
              title={`${seg.ticker}: ${seg.pct.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 sm:p-3 mt-2">
          {allocationSegments.slice(0, 8).map(seg => (
            <span key={seg.ticker} className="text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-gray-400">{seg.ticker}</span>
              <span className="text-gray-600">{seg.pct.toFixed(0)}%</span>
            </span>
          ))}
          {allocationSegments.length > 8 && (
            <span className="text-xs text-gray-600">+{allocationSegments.length - 8} more</span>
          )}
        </div>
      </div>

      {/* Holdings Grid - 4 columns, compact */}
      <div className="grid grid-cols-2 gap-2 sm:p-3">
        {sortedHoldings.map((h, i) => {
          const pct = parsePct(h.returnPct);
          const value = parseMoney(h.currentValue);
          const cost = parseMoney(h.costBasis);
          const valuePct = totalValue > 0 ? (value / totalValue) * 100 : 0;
          const isPositive = pct >= 0;
          
          return (
            <div 
              key={i} 
              className="border border-gray-700 rounded bg-gray-800/50 p-2 sm:p-3 relative overflow-hidden"
            >
              {/* Return bar at bottom */}
              <div 
                className="absolute bottom-0 left-0 h-1 transition-all"
                style={{ 
                  width: `${Math.min(100, Math.abs(pct))}%`,
                  backgroundColor: getReturnColor(pct)
                }}
              />
              
              {/* Ticker & Value */}
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-sm" style={{ color: TICKER_COLORS[h.ticker] || '#fff' }}>
                    {h.ticker}
                  </h3>
                  <p className="text-xs text-gray-500">{valuePct.toFixed(1)}% of portfolio</p>
                </div>
                <span className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {h.returnPct}
                </span>
              </div>
              
              {/* Current Value */}
              <p className="text-sm font-semibold text-white mb-2">{h.currentValue}</p>
              
              {/* Mini return bar */}
              <div className="relative h-1.5 bg-gray-700 rounded overflow-hidden mb-1">
                {/* Center line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-500 z-10" />
                {/* Return indicator */}
                <div 
                  className="absolute top-0 bottom-0 transition-all"
                  style={{
                    left: pct >= 0 ? '50%' : `${50 + pct}%`,
                    width: `${Math.min(50, Math.abs(pct))}%`,
                    backgroundColor: getReturnColor(pct)
                  }}
                />
              </div>
              
              {/* Shares & Cost */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>{h.shares} shares</span>
                <span>Cost: {h.costBasis}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
