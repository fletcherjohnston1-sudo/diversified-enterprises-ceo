import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('/home/clawd/.openclaw/workspace-ceo/mission-control/database/mission-control.db');

export async function GET() {
  try {
    const reports = db.prepare('SELECT id, date, title, created_at FROM reports ORDER BY date DESC').all();
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, title, data_json } = body;
    
    const stmt = db.prepare('INSERT INTO reports (date, title, data_json) VALUES (?, ?, ?)');
    const result = stmt.run(date, title, JSON.stringify(data_json));
    
    return NextResponse.json({ id: result.lastInsertRowid, date, title });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
