import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl, isS3Configured } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const { fileName, contentType, folder = 'builds' } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    // Check if S3 credentials are configured in environment
    if (!isS3Configured) {
      // Provide a simulated/local direct mode fallback with friendly notification
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const mockKey = `${folder}/${timestamp}_${cleanFileName}`;
      const mockFileUrl = `https://mock-storage.local/${mockKey}`;

      return NextResponse.json({
        configured: false,
        warning: 'AWS S3 credentials not found in .env.local. Operating in demo mode.',
        uploadUrl: '/api/upload/mock',
        fileUrl: mockFileUrl,
        s3Key: mockKey,
      });
    }

    const mime = contentType || (fileName.endsWith('.ipa') ? 'application/octet-stream' : 'application/vnd.android.package-archive');

    const result = await getPresignedUploadUrl({
      fileName,
      contentType: mime,
      folder,
    });

    return NextResponse.json({
      configured: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Presign URL generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

