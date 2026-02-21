'use client';

import { useEffect, useState } from 'react';

interface Holding {
  ticker: string;
  shares: string;
  avgPrice: string;
  marketValue: string;
  value: number;
  category: 'stock' | 'etf' | 'mutual_fund' | 'option';
}

interface Account {
  id: string;
  name: string;
  type: string;
  total: number;
  holdings: {
    stocks: Holding[];
    etfs: Holding[];
    mutualFunds: Holding[];
    options: Holding[];
  };
}

function formatMoney(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    stock: 'bg-blue-900 text-blue-300',
    etf: 'bg-purple-900 text-purple-300',
    mutual_fund: 'bg-green-900 text-green-300',
    option: 'bg-red-900 text-red-300'
  };
  const labels: Record<string, string> = {
    stock: 'Stock',
    etf: 'ETF',
    mutual_fund: 'Mutual Fund',
    option: 'Option'
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[category] || 'bg-gray-700'}`}>
      {labels[category] || category}
    </span>
  );
}

function HoldingRow({ holding }: { holding: Holding }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 hover:bg-gray-700 rounded">
      <div className="flex items-center gap-3">
        <span className="font-medium text-white">{holding.ticker}</span>
        <CategoryBadge category={holding.category} />
      </div>
      <div className="text-right">
        <span className="text-white">{holding.marketValue}</span>
        <span className="text-gray-500 text-sm ml-2">{holding.shares} shares</span>
      </div>
    </div>
  );
}

function CategorySection({ title, holdings }: { title: string; holdings: Holding[] }) {
  if (holdings.length === 0) return null;
  
  return (
    <div className="mb-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">{title} ({holdings.length})</h4>
      <div className="space-y-0">
        {holdings.map((h, i) => (
          <HoldingRow key={i} holding={h} />
        ))}
      </div>
    </div>
  );
}

function AccountAccordion({ account }: { account: Account }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 hover:bg-gray-750 transition"
      >
        <div className="text-left">
          <h2 className="text-lg font-semibold text-white">{account.name}</h2>
          <span className="text-xs text-gray-500">{account.type}</span>
        </div>
        <div className="text-right flex items-center gap-3">
          <p className="text-lg font-semibold text-white">{formatMoney(account.total)}</p>
          <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-700 p-3">
          <CategorySection title="Stocks" holdings={account.holdings.stocks} />
          <CategorySection title="ETFs" holdings={account.holdings.etfs} />
          <CategorySection title="Mutual Funds" holdings={account.holdings.mutualFunds} />
          <CategorySection title="Options" holdings={account.holdings.options} />
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/finance/accounts')
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          setAccounts(d.data.accounts);
          setTotal(d.data.total);
          setLastUpdated(d.data.lastUpdated);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">💰 Portfolio</h1>

      {/* Total */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="text-4xl font-bold text-white">{formatMoney(total)}</p>
          </div>
          {lastUpdated && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm text-gray-400">{lastUpdated}</p>
            </div>
          )}
        </div>
      </div>

      {/* Accounts */}
      <div>
        {accounts.map((acct) => (
          <AccountAccordion key={acct.id} account={acct} />
        ))}
      </div>
    </div>
  );
}
