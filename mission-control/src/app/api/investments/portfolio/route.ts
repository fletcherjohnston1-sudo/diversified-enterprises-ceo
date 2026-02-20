import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = '/home/clawd/.openclaw/shared-data/investment/weekly-portfolio-snapshot.json';
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Portfolio data not found' }, { status: 404 });
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
