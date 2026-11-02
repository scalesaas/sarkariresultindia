import { NextRequest, NextResponse } from 'next/server';
import {
  uploadToS3,
  getS3Config,
  initMultipartUpload,
  uploadMultipartChunk,
  completeMultipartUpload,
} from '@/lib/s3';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { configured } = getS3Config();
    if (!configured) {
      return NextResponse.json(
        { error: 'AWS S3 credentials are not configured on the server.' },
        { status: 500 }
      );
    }

    const action = req.headers.get('x-upload-action');

    // 1. Initialize S3 Multipart Upload (for chunked 5MB uploads that never hit 413 Payload Too Large)
    if (action === 'init') {
      const { fileName, folder = 'builds' } = await req.json();
      const mime = fileName?.endsWith('.ipa')
        ? 'application/octet-stream'
        : 'application/vnd.android.package-archive';

      const initData = await initMultipartUpload({
        fileName: fileName || 'build.ipa',
        contentType: mime,
        folder,
      });

      return NextResponse.json({
        success: true,
        ...initData,
      });
    }

    // 2. Upload a single 5MB chunk part
    if (action === 'part') {
      const uploadId = req.headers.get('x-upload-id') || '';
      const s3Key = req.headers.get('x-s3-key') || '';
      const partNumber = parseInt(req.headers.get('x-part-number') || '1', 10);

      const arrayBuffer = await req.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const partRes = await uploadMultipartChunk({
        uploadId,
        s3Key,
        partNumber,
        buffer,
      });

      return NextResponse.json({
        success: true,
        ...partRes,
      });
    }

    // 3. Complete S3 Multipart Upload
    if (action === 'complete') {
      const { uploadId, s3Key, parts } = await req.json();
      const completeRes = await completeMultipartUpload({
        uploadId,
        s3Key,
        parts,
      });

      return NextResponse.json({
        success: true,
        ...completeRes,
      });
    }

    // 4. Legacy single-payload upload (for small files <= 5MB)
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
