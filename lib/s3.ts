import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutBucketCorsCommand,
  PutPublicAccessBlockCommand,
  PutBucketPolicyCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

/**
 * Reads AWS credentials with priority given to .env.local (so stale Windows OS-level
 * AWS_ACCESS_KEY_ID environment variables do not accidentally override .env.local),
 * falling back to process.env for production/Vercel deployments.
 */
export function getS3Config() {
  let envLocal: Record<string, string> = {};
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          envLocal[k] = v;
        }
      }
    }
  } catch {
    // Ignore fs errors in edge/serverless environments
  }

  const region = envLocal.AWS_REGION || process.env.AWS_REGION || 'ap-south-1';
  const accessKeyId = envLocal.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = envLocal.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
  const bucketName = envLocal.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || '';
  const customDomain = envLocal.AWS_S3_CUSTOM_DOMAIN || process.env.AWS_S3_CUSTOM_DOMAIN || '';

  const configured = Boolean(accessKeyId && secretAccessKey && bucketName);

  return {
    region,
    accessKeyId,
    secretAccessKey,
    bucketName,
    customDomain,
    configured,
  };
}

export function getS3Client() {
  const { region, accessKeyId, secretAccessKey, configured } = getS3Config();
  return new S3Client({
    region,
    credentials: configured
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
    // Prevent AWS SDK v3 from injecting dummy 0-byte CRC32 checksums into presigned PUT URLs
    requestChecksumCalculation: 'WHEN_REQUIRED' as any,
    responseChecksumValidation: 'WHEN_REQUIRED' as any,
  });
}

// Track which buckets have already had CORS & Public Read Policy verified in this process
const configuredBuckets = new Set<string>();

/**
 * Ensures the target S3 bucket has CORS and Public Read policy enabled BEFORE
 * the browser attempts a direct PUT upload or mobile devices attempt OTA install.
 */
export async function ensureBucketCors(force = false) {
  const { bucketName, configured } = getS3Config();
  if (!configured || !bucketName) return;
  if (!force && configuredBuckets.has(bucketName)) return;

  const client = getS3Client();

  try {
    // 1. Configure CORS so direct Browser -> S3 PUT uploads never get blocked
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD'],
              AllowedOrigins: ['*'],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      })
    );
  } catch (e) {
    console.warn('PutBucketCors warning:', e);
  }

  try {
    // 2. Ensure public read access so iOS itms-services:// and Android APK downloads work
    await client.send(
      new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          IgnorePublicAcls: false,
          BlockPublicPolicy: false,
          RestrictPublicBuckets: false,
        },
      })
    );

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };

    await client.send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(policy),
      })
    );
  } catch (e) {
    console.warn('PutBucketPolicy warning:', e);
  }

  configuredBuckets.add(bucketName);
}

export function getPublicS3Url(key: string) {
  const { bucketName, region, customDomain } = getS3Config();
  return customDomain
    ? `${customDomain.replace(/\/$/, '')}/${key}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Generate a presigned PUT URL for fast client-side direct 1-hop upload to S3.
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
  const { bucketName, region, configured } = getS3Config();
  if (!configured) {
    throw new Error('AWS S3 is not configured in .env.local');
  }

  // Await CORS & public policy setup so the very first upload to a new bucket succeeds immediately
  await ensureBucketCors();

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const key = `${folder}/${timestamp}_${randomStr}_${cleanFileName}`;

  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  const fileUrl = getPublicS3Url(key);

  return {
    uploadUrl,
    fileUrl,
    s3Key: key,
    bucket: bucketName,
    region,
  };
}

/**
 * Pre-generates and uploads Apple's OTA manifest.plist directly to S3.
 */
export async function uploadIosManifestToS3({
  slug,
  ipaUrl,
  bundleId,
  version,
  title,
}: {
  slug: string;
  ipaUrl: string;
  bundleId: string;
  version: string;
  title: string;
}) {
  const { bucketName, configured } = getS3Config();
  if (!configured) return null;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string><![CDATA[${ipaUrl}]]></string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${bundleId || 'com.app.distribution'}</string>
        <key>bundle-version</key>
        <string>${version || '1.0.0'}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${title || 'App'}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;

  const key = `manifests/${slug}.plist`;
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: Buffer.from(xml, 'utf-8'),
    ContentType: 'application/xml; charset=utf-8',
    CacheControl: 'public, max-age=3600',
  });

  await client.send(command);
  return getPublicS3Url(key);
}

/**
 * Direct server-side upload to S3 for small files.
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
  const { bucketName, configured } = getS3Config();
  if (!configured) {
    throw new Error('AWS S3 is not configured. Please check environment variables.');
  }

  await ensureBucketCors();

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}_${cleanFileName}`;

  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await client.send(command);

  return {
    fileUrl: getPublicS3Url(key),
    s3Key: key,
  };
}

/**
 * Chunked Multipart Upload helpers (prevents 413 Payload Too Large when falling back to server relay)
 */
export async function initMultipartUpload({
  fileName,
  contentType,
  folder = 'builds',
}: {
  fileName: string;
  contentType: string;
  folder?: string;
}) {
  const { bucketName, configured } = getS3Config();
  if (!configured) {
    throw new Error('AWS S3 is not configured.');
  }

  await ensureBucketCors();

  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const key = `${folder}/${timestamp}_${randomStr}_${cleanFileName}`;

  const client = getS3Client();
  const res = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return {
    uploadId: res.UploadId!,
    s3Key: key,
    fileUrl: getPublicS3Url(key),
  };
}

export async function uploadMultipartChunk({
  uploadId,
  s3Key,
  partNumber,
  buffer,
}: {
  uploadId: string;
  s3Key: string;
  partNumber: number;
  buffer: Buffer;
}) {
  const { bucketName } = getS3Config();
  const client = getS3Client();
  const res = await client.send(
    new UploadPartCommand({
      Bucket: bucketName,
      Key: s3Key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: buffer,
    })
  );

  return {
    ETag: res.ETag!,
    PartNumber: partNumber,
  };
}

export async function completeMultipartUpload({
  uploadId,
  s3Key,
  parts,
}: {
  uploadId: string;
  s3Key: string;
  parts: { ETag: string; PartNumber: number }[];
}) {
  const { bucketName } = getS3Config();
  const client = getS3Client();
  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: s3Key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
      },
    })
  );

  return {
    fileUrl: getPublicS3Url(s3Key),
    s3Key,
  };
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string) {
  const { bucketName, configured } = getS3Config();
  if (!configured || !key) return;

  try {
    const client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
  }
}
