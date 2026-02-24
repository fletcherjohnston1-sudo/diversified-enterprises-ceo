import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get('path');

  if (!filePath) {
    return NextResponse.json({ success: false, error: 'No path provided' }, { status: 400 });
  }

  try {
    // Security: only allow files from certain directories
    const allowedDirs = ['/home/clawd/.openclaw/'];
    const isAllowed = allowedDirs.some(dir => filePath.startsWith(dir));
    
    if (!isAllowed) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
