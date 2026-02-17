import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = parseInt(id, 10);

    if (isNaN(fileId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    const file = database.files.findById(fileId) as any;
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete physical file
    const filepath = path.join(UPLOAD_DIR, file.filename);
    if (existsSync(filepath)) {
      await unlink(filepath);
    }

    // Delete database record
    database.files.delete(fileId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
