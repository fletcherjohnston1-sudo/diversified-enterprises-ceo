import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

const PYTHON_SCRIPT = '/home/clawd/.openclaw/workspace/read_portfolio.py';

async function getSheetData(tabName: string, range: string = 'A1:Z100'): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [PYTHON_SCRIPT, tabName, range]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => { stdout += data.toString(); });
    python.stderr.on('data', (data) => { stderr += data.toString(); });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Process exited with code ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed.values || parsed);
      } catch (e) {
        reject(new Error(`Failed to parse JSON: ${stdout}`));
      }
    });
  });
}

function parseMoney(str: string): number {
  if (!str) return 0;
  return parseFloat(str.replace(/[$,]/g, '')) || 0;
}

// Common ETF and Mutual Fund symbols
const ETFS = new Set(['QQQ', 'SPY', 'VOO', 'IVV', 'DIA', 'VTI', 'SCHB', 'ITOT', 'VTV', 'VUG', 'VIG', 'XLE', 'XLF', 'XLV', 'XLK', 'XLI', 'XLP', 'XLY', 'XLC', 'XHB', 'XSD', 'IBIT', 'BITO', 'ETHA', 'ARKB', 'FBTC', 'GBTC']);
const MUTUAL_FUNDS = new Set(['VLXVX', 'VASGX', 'VSIAX', 'VMGMX', 'VSMAX', 'VSGAX', 'VTSAX', 'VGSLX', 'VWUSX', 'VBTLX', 'FDGRX', 'FXAIX', 'FSKAX', 'FTIHX']);

function categorizeTicker(ticker: string): 'stock' | 'etf' | 'mutual_fund' | 'option' {
  if (ticker.includes(' ') || ticker.includes('/')) return 'option';
  if (ETFS.has(ticker)) return 'etf';
  if (MUTUAL_FUNDS.has(ticker)) return 'mutual_fund';
  return 'stock';
}

export async function GET() {
  try {
    // Get accounts
    const accountsData = await getSheetData('Accounts', 'A1:Z10');
    // Get full portfolio
    const portfolioData = await getSheetData('Full Portfolio', 'A1:Z100');
    // Get Schwab raw for timestamp
    const schwabRaw = await getSheetData('Schwab Raw', 'A1:J1');
    const lastUpdated = schwabRaw[0]?.[9] || null;

    const accounts: Record<string, { name: string; type: string; total: number; holdings: any[] }> = {};

    // Parse accounts
    for (let i = 1; i < accountsData.length; i++) {
      const row = accountsData[i];
      if (row && row[0]) {
        accounts[row[0]] = {
          name: row[1] || 'Unknown',
          type: row[2] || 'Unknown',
          total: 0,
          holdings: []
        };
      }
    }

    // Parse holdings and aggregate by account
    for (let i = 1; i < portfolioData.length; i++) {
      const row = portfolioData[i];
      if (!row || row.length < 6) continue;

      const accountId = row[0];
      const ticker = row[2];
      const shares = row[3];
      const avgPrice = row[4];
      const marketValue = row[5];

      if (!accountId || !ticker || ticker === '#N/A') continue;

      const value = parseMoney(marketValue);
      const category = categorizeTicker(ticker);

      if (accounts[accountId]) {
        accounts[accountId].total += value;
        accounts[accountId].holdings.push({
          ticker,
          shares,
          avgPrice,
          marketValue,
          value,
          category
        });
      }
    }

    // Process each account: sort within categories
    const accountList = Object.entries(accounts).map(([id, data]) => {
      // Group by category
      const stocks = data.holdings.filter(h => h.category === 'stock').sort((a, b) => b.value - a.value);
      const etfs = data.holdings.filter(h => h.category === 'etf').sort((a, b) => b.value - a.value);
      const mutualFunds = data.holdings.filter(h => h.category === 'mutual_fund').sort((a, b) => b.value - a.value);
      const options = data.holdings.filter(h => h.category === 'option').sort((a, b) => b.value - a.value);

      return {
        id,
        name: data.name,
        type: data.type,
        total: data.total,
        holdings: {
          stocks,
          etfs,
          mutualFunds,
          options
        }
      };
    });

    // Calculate grand total
    let grandTotal = accountList.reduce((sum, acct) => sum + acct.total, 0);

    // Sort by total descending
    accountList.sort((a, b) => b.total - a.total);

    return NextResponse.json({
      success: true,
      data: {
        accounts: accountList,
        total: grandTotal,
        lastUpdated
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
