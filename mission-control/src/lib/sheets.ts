import { spawn } from 'child_process';

const PYTHON_SCRIPT = '/home/clawd/.openclaw/workspace/read_portfolio.py';

export interface SheetData {
  values: string[][];
}

export async function getSheetData(tabName: string, range: string = 'A1:Z100'): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [PYTHON_SCRIPT, tabName, range]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

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

export async function getMasterSummary(): Promise<{
  portfolios: Array<{
    name: string;
    allocation: string;
    invested: string;
    current: string;
    returnPct: string;
    toInvest: string;
  }>;
  total: {
    invested: string;
    current: string;
    returnPct: string;
    toInvest: string;
  };
}> {
  const data = await getSheetData('Master Summary', 'A1:H50');
  
  const portfolios: Array<{
    name: string;
    allocation: string;
    invested: string;
    current: string;
    returnPct: string;
    toInvest: string;
  }> = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const firstCell = row[0]?.toString().trim();
    
    if (firstCell === 'TOTAL') {
      return {
        portfolios,
        total: {
          invested: row[2] || '',
          current: row[3] || '',
          returnPct: row[4] || '',
          toInvest: row[5] || ''
        }
      };
    }
    
    if (firstCell && firstCell !== 'Portfolio' && firstCell !== 'TOTAL') {
      portfolios.push({
        name: firstCell,
        allocation: row[1] || '',
        invested: row[2] || '',
        current: row[3] || '',
        returnPct: row[4] || '',
        toInvest: row[5] || ''
      });
    }
  }
  
  return { portfolios, total: { invested: '', current: '', returnPct: '', toInvest: '' } };
}

export interface Holding {
  ticker: string;
  company: string;
  shares: string;
  costBasis: string;
  currentValue: string;
  returnPct: string;
}

export async function getPortfolioHoldings(tabName: string): Promise<Holding[]> {
  const data = await getSheetData(tabName, 'A1:Z100');
  const holdings: Holding[] = [];
  
  if (data.length < 2) return holdings;
  
  const headerRow = data[0].map(h => h?.toLowerCase() || '');
  
  // Find column indices based on header names
  const colIndex: Record<string, number> = {};
  headerRow.forEach((h, i) => {
    if (h.includes('ticker')) colIndex.ticker = i;
    else if (h.includes('shares') && !h.includes('avg')) colIndex.shares = i;
    else if (h.includes('invested') && !h.includes('avg')) colIndex.costBasis = i;
    else if (h.includes('current') && h.includes('value')) colIndex.currentValue = i;
    else if (h.includes('gain') && h.includes('%') || h.includes('loss') && h.includes('%')) colIndex.returnPct = i;
  });
  
  // Default fallback mapping for older format (AI Infra has extra column)
  if (colIndex.shares === undefined) colIndex.shares = 3;
  if (colIndex.costBasis === undefined) colIndex.costBasis = 4;
  if (colIndex.currentValue === undefined) colIndex.currentValue = 7;
  if (colIndex.returnPct === undefined) colIndex.returnPct = 9;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const ticker = row[colIndex.ticker ?? 0]?.toString().trim();
    
    // Skip empty rows and Total/summary rows
    if (!ticker || ticker === '' || ticker.toLowerCase().includes('total')) continue;
    
    // Skip rows with no shares (summary rows)
    if (!row[colIndex.shares] || row[colIndex.shares] === '') continue;
    
    holdings.push({
      ticker: ticker,
      company: '',
      shares: row[colIndex.shares] || '',
      costBasis: row[colIndex.costBasis] || '',
      currentValue: row[colIndex.currentValue] || '',
      returnPct: row[colIndex.returnPct] || ''
    });
  }
  
  return holdings;
}