import { NextResponse } from 'next/server';
import { getMasterSummary } from '@/lib/sheets';

export async function GET() {
  try {
    const data = await getMasterSummary();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}