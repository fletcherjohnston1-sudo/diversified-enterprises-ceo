import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id, 10);

    if (isNaN(conversationId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    const conversation = database.conversations.findById(conversationId) as { project_id: number } | undefined;

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, status } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Normalize status to match KanbanBoard expectations (capitalized)
    const normalizedStatus = status 
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : 'Backlog';

    const task = database.tasks.create({
      title,
      status: normalizedStatus,
      project_id: conversation.project_id,
      conversation_id: conversationId,
      auto_created: 1
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}