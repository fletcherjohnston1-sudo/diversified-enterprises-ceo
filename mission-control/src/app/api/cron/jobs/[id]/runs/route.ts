import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

interface CronRun {
  ts: number;
  jobId: string;
  action: string;
  status: string;
  summary?: string;
  runAtMs: number;
  durationMs: number;
  nextRunAtMs: number;
}

function parseRunsJson(output: string): CronRun[] {
  try {
    const jsonStart = output.indexOf('{');
    if (jsonStart === -1) return [];
    
    const jsonStr = output.slice(jsonStart);
    const data = JSON.parse(jsonStr);
    
    return (data.entries || []).map((entry: any) => ({
      ts: entry.ts,
      jobId: entry.jobId,
      action: entry.action,
      status: entry.status,
      summary: entry.summary,
      runAtMs: entry.runAtMs,
      durationMs: entry.durationMs,
      nextRunAtMs: entry.nextRunAtMs,
    }));
  } catch (e) {
    console.error('Failed to parse runs JSON:', e);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  
  return new Promise((resolve) => {
    const proc = spawn('openclaw', ['cron', 'runs', '--id', id, '--limit', '10'], {
      shell: true,
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        resolve(NextResponse.json(
          { success: false, error: errorOutput || 'Command failed' },
          { status: 500 }
        ));
        return;
      }

      const runs = parseRunsJson(output);
      resolve(NextResponse.json({ success: true, data: runs }));
    });

    proc.on('error', (err) => {
      resolve(NextResponse.json(
        { success: false, error: err.message },
        { status: 500 }
      ));
    });
  });
}
