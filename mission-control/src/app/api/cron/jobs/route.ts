import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

interface CronJobState {
  nextRunAtMs: number;
  lastRunAtMs: number;
  lastStatus: string;
}

interface CronJob {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr?: string;
    tz?: string;
  };
  nextRunAtMs: number;
  lastRunAtMs: number;
  lastStatus: string;
}

function formatAgentName(agentId: string): string {
  if (agentId.includes('_')) {
    return '@' + agentId.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }
  return '@' + agentId.charAt(0).toUpperCase() + agentId.slice(1);
}

function parseCronJson(output: string): CronJob[] {
  try {
    // Find JSON start
    const jsonStart = output.indexOf('{');
    if (jsonStart === -1) return [];
    
    const jsonStr = output.slice(jsonStart);
    const data = JSON.parse(jsonStr);
    const jobs: CronJob[] = [];
    
    for (const job of data.jobs || []) {
      const state = job.state || {};
      
      jobs.push({
        id: job.id,
        name: job.name,
        agentId: job.agentId,
        agentName: formatAgentName(job.agentId),
        enabled: job.enabled ?? true,
        schedule: {
          kind: job.schedule?.kind || 'unknown',
          expr: job.schedule?.expr,
          tz: job.schedule?.tz,
        },
        nextRunAtMs: state.nextRunAtMs || 0,
        lastRunAtMs: state.lastRunAtMs || 0,
        lastStatus: state.lastStatus || 'idle',
      });
    }
    
    return jobs;
  } catch (e) {
    console.error('Failed to parse cron JSON:', e);
    return [];
  }
}

export async function GET(): Promise<Response> {
  return new Promise((resolve) => {
    const proc = spawn('openclaw', ['cron', 'list', '--json'], {
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
          { success: false, error: errorOutput || 'Command failed', output: output.slice(0, 200) },
          { status: 500 }
        ));
        return;
      }

      const jobs = parseCronJson(output);
      resolve(NextResponse.json({ success: true, data: jobs }));
    });

    proc.on('error', (err) => {
      resolve(NextResponse.json(
        { success: false, error: err.message },
        { status: 500 }
      ));
    });
  });
}
