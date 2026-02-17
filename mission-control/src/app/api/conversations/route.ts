import { NextResponse } from 'next/server';
import { database } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');
    const sender_id = searchParams.get('sender_id');
    const limit = searchParams.get('limit');

    const filters: { channel?: string; sender_id?: string; limit?: number } = {};
    if (channel) filters.channel = channel;
    if (sender_id) filters.sender_id = sender_id;
    if (limit) filters.limit = parseInt(limit);

    const conversations = database.conversations.findAll(filters);
    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
