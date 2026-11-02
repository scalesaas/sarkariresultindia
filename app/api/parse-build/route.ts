import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No build file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const isIpa = fileName.toLowerCase().endsWith('.ipa');
    const isApk = fileName.toLowerCase().endsWith('.apk');

    if (!isIpa && !isApk) {
      return NextResponse.json(
        { error: 'Only .ipa (iOS) and .apk (Android) files are supported' },
        { status: 400 }
      );
    }

    const platform = isIpa ? 'ios' : 'android';

    // Write file to temporary folder so AppInfoParser can read it
    const ext = isIpa ? '.ipa' : '.apk';
    const tempFileName = `parse_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(tempFilePath, buffer);

    // Dynamic require for AppInfoParser
    const AppInfoParser = require('app-info-parser');
    const parser = new AppInfoParser(tempFilePath);
    
    let parsedInfo: any = {};
    try {
      parsedInfo = await parser.parse();
    } catch (parseErr) {
      console.warn('AppInfoParser parse failed, using fallback:', parseErr);
    }

    let title = '';
    let version = '1.0.0';
    let buildNumber = '1';
    let bundleId = '';
    let minOsVersion = '';
    let icon = '';

    if (isIpa) {
      title = parsedInfo.CFBundleDisplayName || parsedInfo.CFBundleName || fileName.replace(/\.ipa$/i, '');
      version = parsedInfo.CFBundleShortVersionString || '1.0.0';
      buildNumber = parsedInfo.CFBundleVersion ? String(parsedInfo.CFBundleVersion) : '1';
      bundleId = parsedInfo.CFBundleIdentifier || 'com.app.ios';
      minOsVersion = parsedInfo.MinimumOSVersion ? `iOS ${parsedInfo.MinimumOSVersion}+` : 'iOS 15.0+';
      icon = parsedInfo.icon || '';
    } else {
      // Android
      const label = parsedInfo.application?.label;
      if (Array.isArray(label)) {
        title = label[0] || '';
      } else if (typeof label === 'string') {
        title = label;
      }
      if (!title) {
        title = fileName.replace(/\.apk$/i, '');
      }

      version = parsedInfo.versionName || '1.0.0';
      buildNumber = parsedInfo.versionCode ? String(parsedInfo.versionCode) : '1';
      bundleId = parsedInfo.package || 'com.app.android';

      const minSdk = parsedInfo.usesSdk?.minSdkVersion;
      minOsVersion = minSdk ? `Android SDK ${minSdk}+` : 'Android 8.0+';
      icon = parsedInfo.icon || '';
    }

    return NextResponse.json({
      success: true,
      platform,
      title,
      version,
      build_number: buildNumber,
      bundle_id: bundleId,
      min_os_version: minOsVersion,
      icon,
      file_name: fileName,
      file_size: file.size,
    });
  } catch (error: any) {
    console.error('Error in /api/parse-build:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to parse package information' },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.error('Failed to remove temp file:', e);
      }
    }
  }
}

