'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PortfolioSummary {
  name: string;
  allocation: string;
  invested: string;
  current: string;
  returnPct: string;
  toInvest: string;
}

interface Total {
  invested: string;
  current: string;
  returnPct: string;
  toInvest: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    portfolios: PortfolioSummary[];
    total: Total;
  };
  error?: string;
}

function parseMoney(str: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, '')) || 0;
}

const PORTFOLIO_CONFIG: Record<string, { id: string; color: string; bg: string }> = {
  'AI Infrastructure': { id: 'ai-infra', color: '#3B82F6', bg: 'bg-blue-900/30' },
  'Block Chain': { id: 'blockchain', color: '#8B5CF6', bg: 'bg-purple-900/30' },
  'China': { id: 'china', color: '#EF4444', bg: 'bg-red-900/30' },
};

export default function FinancePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/finance/summary')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setData({ success: false, error: err.message });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-3 text-gray-400">Loading...</div>;
  }

  if (!data?.success || !data.data) {
    return <div className="p-6">Error: {data?.error || 'Failed to load'}</div>;
  }

  const { portfolios, total } = data.data;

  const totalInvested = parseMoney(total.invested);
  const totalCurrent = parseMoney(total.current);
  const totalReturn = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested * 100) : 0;

  return (
    <div className="p-3">
      <h1 className="text-base font-bold mb-2">Portfolio Overview</h1>
      
      {/* Portfolio Cards - Compact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {portfolios.map((p, i) => {
          const config = PORTFOLIO_CONFIG[p.name] || { id: '', color: '#6B7280', bg: 'bg-gray-800' };
          const invested = parseMoney(p.invested);
          const current = parseMoney(p.current);
          const ret = invested > 0 ? ((current - invested) / invested * 100) : 0;
          const isPositive = ret >= 0;
          
          return (
            <Link 
              key={i} 
              href={`/finance/${config.id}`}
              className={`block border border-gray-700 rounded-lg p-3 ${config.bg} hover:border-gray-500 transition group`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-sm" style={{ color: config.color }}>{p.name}</h2>
                <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {ret > 0 ? '+' : ''}{ret.toFixed(1)}%
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Invested</p>
                  <p className="text-gray-200 font-medium">{p.invested}</p>
                </div>
                <div>
                  <p className="text-gray-500">Current</p>
                  <p className="text-white font-semibold">{p.current}</p>
                </div>
              </div>
              
              {/* Mini return bar */}
              <div className="mt-2 h-1.5 bg-gray-700 rounded overflow-hidden">
                <div 
                  className="h-full transition-all"
                  style={{ 
                    width: `${Math.min(100, Math.abs(ret))}%`,
                    backgroundColor: isPositive ? '#10B981' : '#EF4444'
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400">Total Portfolio</h2>
          <span className={`text-sm font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </span>
        </div>
        
        <div className="grid grid grid-cols-2 gap-3 gap-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Invested</p>
            <p className="text-lg font-semibold">{total.invested}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Current Value</p>
            <p className="text-lg font-semibold">{total.current}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Return</p>
            <p className={`text-lg font-semibold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {total.returnPct}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">Dry Powder</p>
            <p className="text-lg font-semibold">{total.toInvest}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
