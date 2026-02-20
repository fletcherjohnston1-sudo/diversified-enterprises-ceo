import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days') || '7';
  
  return new Promise<NextResponse>((resolve) => {
    const env = { ...process.env, GOG_KEYRING_PASSWORD: 'openclaw123' };
    const gog = spawn('gog', ['calendar', 'list', '--json', '-a', 'fletcherjohnston1@gmail.com'], { env });
    
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
        resolve(NextResponse.json({ error: stderr || 'Failed to fetch calendar' }, { status: 500 }));
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
        resolve(NextResponse.json({ events }));
      } catch (err) {
        resolve(NextResponse.json({ error: 'Failed to parse calendar data' }, { status: 500 }));
      }
    });
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { title, start, end, description, location } = body;
    
    const args = ['calendar', 'create', 'primary', '-a', 'fletcherjohnston1@gmail.com'];
    if (title) args.push('--summary', title);
    // Add timezone if not present (RFC3339 format)
    if (start) args.push('--from', start.includes('Z') || start.includes('+') || (start.length > 19 && !start.endsWith('-05:00')) ? start : start + '-05:00');
    if (end) args.push('--to', end.includes('Z') || end.includes('+') || (end.length > 19 && !end.endsWith('-05:00')) ? end : end + '-05:00');
    if (description) args.push('--description', description);
    if (location) args.push('--location', location);
    
    return new Promise<NextResponse>((resolve) => {
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
          resolve(NextResponse.json({ error: stderr || 'Failed to create event' }, { status: 500 }));
          return;
        }
        resolve(NextResponse.json({ success: true, output: stdout }));
      });
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}