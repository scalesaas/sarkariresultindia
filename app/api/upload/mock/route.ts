import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  // Mock endpoint to simulate direct S3 upload when credentials are not configured
  return NextResponse.json({ success: true, message: 'Mock upload successful' });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ success: true, message: 'Mock upload successful' });
}

