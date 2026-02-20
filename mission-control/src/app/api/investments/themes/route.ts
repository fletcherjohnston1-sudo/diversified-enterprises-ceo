import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  try {
    const filePath = '/home/clawd/.openclaw/shared-data/investment/weekly-theme-report.json';
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Theme data not found' }, { status: 404 });
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
