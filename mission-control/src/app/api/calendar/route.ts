import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Try each available account
  const accounts = ['fletcherjohnston1@gmail.com', 'claudiusjohnston1@gmail.com', 'personal'];
  
  for (const account of accounts) {
    try {
      const result = await fetchCalendar(account);
      if (result.events.length > 0) {
        return NextResponse.json({ events: result.events, source: account });
      }
    } catch {
      continue;
    }
  }
  
  return NextResponse.json({ events: [], error: 'No calendar access' });
}

async function fetchCalendar(account: string): Promise<{ events: any[] }> {
  return new Promise((resolve) => {
    const env = { ...process.env, GOG_KEYRING_PASSWORD: 'openclaw123' };
    const gog = spawn('gog', ['calendar', 'list', '--json', '-a', account], { env, timeout: 10000 });
    
    let stdout = '';
    let stderr = '';
    
    gog.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    gog.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    gog.on('close', (code) => {
      if (code !== 0) {
        resolve({ events: [] });
        return;
      }
      
      try {
        const data = JSON.parse(stdout);
        const events = (data.events || []).map((e: any) => ({
          id: e.id,
          title: e.summary,
          start: e.start?.dateTime || e.start?.date,
          end: e.end?.dateTime || e.end?.date,
          location: e.location,
          description: e.description,
          htmlLink: e.htmlLink,
        }));
        resolve({ events });
      } catch {
        resolve({ events: [] });
      }
    });
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { title, start, end, description, location } = body;
    
    const accounts = ['fletcherjohnston1@gmail.com', 'claudiusjohnston1@gmail.com', 'personal'];
    
    for (const account of accounts) {
      try {
        const result = await createCalendarEvent(account, { title, start, end, description, location });
        if (result.success) {
          return NextResponse.json({ success: true, event: result.event });
        }
      } catch {
        continue;
      }
    }
    
    return NextResponse.json({ error: 'Failed to create event - no calendar access' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function createCalendarEvent(account: string, event: { title: string; start: string; end: string; description?: string; location?: string }): Promise<{ success: boolean; event?: any }> {
  return new Promise((resolve) => {
    const args = ['calendar', 'create', 'primary', '-a', account];
    if (event.title) args.push('--summary', event.title);
    if (event.start) args.push('--from', event.start);
    if (event.end) args.push('--to', event.end);
    if (event.description) args.push('--description', event.description);
    if (event.location) args.push('--location', event.location);
    
    const env = { ...process.env, GOG_KEYRING_PASSWORD: 'openclaw123' };
    const gog = spawn('gog', args, { env });
    
    let stdout = '';
    let stderr = '';
    
    gog.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    gog.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    gog.on('close', (code) => {
      if (code !== 0) {
        resolve({ success: false });
        return;
      }
      resolve({ success: true, event: { title: event.title, start: event.start, end: event.end } });
    });
  });
}