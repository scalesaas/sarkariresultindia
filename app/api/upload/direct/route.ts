import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, isS3Configured } from '@/lib/s3';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Allow sufficient time for large builds

export async function POST(req: NextRequest) {
  try {
    if (!isS3Configured) {
      return NextResponse.json(
        { error: 'AWS S3 credentials are not configured on the server.' },
        { status: 500 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let buffer: Buffer;
    let fileName = req.headers.get('x-file-name') || 'build.ipa';
    let folder = req.headers.get('x-folder') || 'builds';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
      }
      buffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      folder = (formData.get('folder') as string) || folder;
    } else {
      // Direct raw binary stream upload
      const arrayBuffer = await req.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Empty file payload' }, { status: 400 });
    }

    const mime = fileName.endsWith('.ipa')
      ? 'application/octet-stream'
      : 'application/vnd.android.package-archive';

    const result = await uploadToS3({
      buffer,
      fileName,
      contentType: mime,
      folder,
    });

    return NextResponse.json({
      success: true,
      fileUrl: result.fileUrl,
      s3Key: result.s3Key,
    });
  } catch (error: any) {
    console.error('Server upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server upload failed' },
      { status: 500 }
    );
  }
}
