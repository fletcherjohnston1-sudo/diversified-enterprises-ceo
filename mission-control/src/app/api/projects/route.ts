import { NextResponse } from 'next/server';
import { database } from '@/lib/db';

export async function GET() {
  try {
    const projects = database.projects.findAll();
    // Get task and conversation counts for each project
    const projectsWithCounts = projects.map((project: any) => {
      const tasks = database.tasks.findAll({ project_id: project.id });
      const conversations = database.conversations.findAll({ project_id: project.id, limit: 1000 });
      return {
        ...project,
        task_count: tasks.length,
        conversation_count: conversations.length
      };
    });
    return NextResponse.json({ success: true, data: projectsWithCounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const project = database.projects.create({
      name,
      description,
      color
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
