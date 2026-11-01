# AppDrop - APK & IPA Over-The-Air (OTA) Distribution Platform
### Modern Diawi & Apps on Air Alternative

A platform for uploading, managing, and distributing iOS (`.ipa`) and Android (`.apk`) builds over-the-air. Built with **Next.js 14 (App Router)**, **AWS S3 Storage**, **Supabase Database & Google OAuth**, and **Apple OTA Wireless Manifest Protocol**.

---

## 🚀 Key Features

- 📱 **iOS OTA Direct Installation (`itms-services://`)**:
  - Automatically generates an Apple Enterprise & Ad-Hoc wireless manifest (`manifest.plist`).
  - Testers tap **"Install App"** in Safari and the app installs directly to their home screen without cables or App Store.
- 🤖 **Android Direct APK Installation**:
  - Direct download and install for Android `.apk` builds with one tap.
- ⚡ **Direct AWS S3 Presigned Uploads**:
  - Bypasses server payload limits using S3 presigned PUT URLs, allowing multi-gigabyte build uploads with real-time percentage progress bars.
- 🏢 **Multi-Environment Releases (DEV, UAT, PROD, STAGING)**:
  - Convenient right-hand drawer in the console to tag and organize releases by environment.
  - Separate builds for QA testing (`DEV`), client sign-offs (`UAT`), and final candidates (`PROD`).
- 🔗 **Instant Public Link & Scannable QR Code**:
  - Shareable public download link (`/download/<slug>` or `/d/<slug>`).
  - Instant high-resolution scannable QR code to open and install directly from mobile cameras.
- ⏳ **Smart Retention Policy**:
  - **Free Tier**: Builds remain active for **20 days** (`expires_at = now() + 20 days`).
  - **Paid / Pro Tier**: **Lifetime** permanent retention (`expires_at = null`).
  - Visual badge displaying countdown and plan status.
- 🔐 **Google OAuth & Supabase Authentication**:
  - Sign in with Google or email/password.
  - Personal dashboard to manage, filter, inspect, and delete releases.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + RLS + Google OAuth)
- **Storage**: AWS S3 (`@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner`)
- **Styling**: Tailwind CSS + Shadcn UI
- **QR Code**: `qrcode` library

---

## ⚙️ Setup & Configuration

### 1. Database Setup (Supabase)
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab.
3. Copy and run the entire script found in `supabase-schema.sql`.
   This creates the `profiles`, `apps`, and `releases` tables, row-level security (RLS) policies, and auto-profile triggers.

### 2. Google OAuth Setup (Supabase)
1. In your Supabase Dashboard, go to **Authentication** > **Providers** > **Google**.
2. Enable Google sign-in and provide your Google OAuth Client ID and Secret (from Google Cloud Console).
3. Set the Authorized Redirect URI to:
   `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`

### 3. AWS S3 Bucket Setup
1. Create an S3 Bucket in the AWS Console (e.g. `my-appdrop-builds`).
2. Configure **CORS** on your S3 bucket (under Permissions tab > Cross-origin resource sharing):
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. Create an IAM User with `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` permissions on the bucket.

### 4. Environment Variables (`.env.local`)
Create or edit `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...

# AWS S3 Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=my-appdrop-builds
# Optional: AWS_S3_CUSTOM_DOMAIN=https://cdn.yourdomain.com

# Domain
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🏃 Run Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the homepage and upload builds.
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the distribution console.
