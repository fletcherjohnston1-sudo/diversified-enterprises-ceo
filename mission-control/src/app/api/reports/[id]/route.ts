import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('/home/clawd/.openclaw/workspace-ceo/mission-control/database/mission-control.db');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
