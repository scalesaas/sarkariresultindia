import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
const customDomain = process.env.AWS_S3_CUSTOM_DOMAIN || '';

export const isS3Configured = Boolean(
  accessKeyId && 
  secretAccessKey && 
  bucketName
);

export const s3Client = new S3Client({
  region,
  credentials: isS3Configured ? {
    accessKeyId,
    secretAccessKey,
  } : undefined,
});

/**
 * Generate a presigned PUT URL for client-side direct upload to S3.
 * Ideal for large APK & IPA files (up to several GBs).
 */
export async function getPresignedUploadUrl({
  fileName,
  contentType,
  folder = 'builds',
}: {
  fileName: string;
  contentType: string;
  folder?: string;
}) {
  if (!isS3Configured) {
    throw new Error('AWS S3 is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in .env.local');
  }

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const key = `${folder}/${timestamp}_${randomStr}_${cleanFileName}`;

  // Do NOT restrict ContentType in PutObjectCommand for presigned URL.
  // This avoids SigV4 signature mismatches when the browser sends a different or empty Content-Type.
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  // Signed URL valid for 30 minutes
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 1800 });

  // Public/direct download URL
  const fileUrl = customDomain 
    ? `${customDomain.replace(/\/$/, '')}/${key}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    fileUrl,
    s3Key: key,
    bucket: bucketName,
  };
}

/**
 * Direct server-side upload to S3 for fallback or small files.
 */
export async function uploadToS3({
  buffer,
  fileName,
  contentType,
  folder = 'builds',
}: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}) {
  if (!isS3Configured) {
    throw new Error('AWS S3 is not configured. Please check environment variables.');
  }

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}_${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const fileUrl = customDomain 
    ? `${customDomain.replace(/\/$/, '')}/${key}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return {
    fileUrl,
    s3Key: key,
  };
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string) {
  if (!isS3Configured || !key) return;

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
  }
}

