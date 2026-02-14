import { NextResponse } from 'next/server';
import { database } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const project_id = searchParams.get('project_id');
    
    const filters: { status?: string; project_id?: number } = {};
    if (status) filters.status = status;
    if (project_id) filters.project_id = parseInt(project_id);
    
    const tasks = database.tasks.findAll(filters);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = database.tasks.create(body);
    return NextResponse.json({ success: true, data: task });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
