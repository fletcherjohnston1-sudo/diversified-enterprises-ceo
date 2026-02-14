import { NextResponse } from 'next/server';
import { database } from '@/lib/db';

export async function GET() {
  try {
    const projects = database.projects.findAll();
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
