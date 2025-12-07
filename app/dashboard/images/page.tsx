"use client"
import React, { useEffect, useState, useRef } from 'react';
import { listallimages } from '@/lib/actions/blog';
import { onUploadImageAction } from '../blog/components/feats/file/actions/image-upload.action';
import { Copy, Check, Upload, X, Plus } from 'lucide-react';
import Image from 'next/image';
const Page: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const fetchImages = async () => {
    try {
      setLoading(true);
      const imageList = await listallimages();
      
      // Filter out any non-image files and get only the 13 most recent
      const imageUrls = imageList
        .filter((image: any) => image.metadata.mimetype.startsWith('image/'))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by creation date (newest first)
        .slice(0, 13) // Take only the first 13 images
        .map((image: any) => `${url}/storage/v1/object/public/images/uploads/${image.name}`);
      
      setImages(imageUrls);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [url]);

  const copyToClipboard = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Could not copy text:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset previous messages
    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await onUploadImageAction(formData);

      if (result.success) {
        setUploadSuccess('Image uploaded successfully!');
        // Refresh the gallery to show the new image
        await fetchImages();
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Hide success message after 3 seconds
        setTimeout(() => setUploadSuccess(null), 3000);
      } else {
        setUploadError(result.message || 'Failed to upload image');
        setTimeout(() => setUploadError(null), 5000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  const dismissMessage = (type: 'success' | 'error') => {
    if (type === 'success') {
      setUploadSuccess(null);
    } else {
      setUploadError(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Recent Images</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(13)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Recent Images</h1>
              <p className="text-gray-600">Showing {images.length} most recent images</p>
            </div>
            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>Upload Image</span>
                </>
              )}
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="text-green-600" size={20} />
                <span className="text-green-800 font-medium">{uploadSuccess}</span>
              </div>
              <button
                onClick={() => dismissMessage('success')}
                className="text-green-600 hover:text-green-800"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X className="text-red-600" size={20} />
                <span className="text-red-800 font-medium">{uploadError}</span>
              </div>
              <button
                onClick={() => dismissMessage('error')}
                className="text-red-600 hover:text-red-800"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No images found</div>
            <button
              onClick={handleFileSelect}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus size={20} />
              <span>Upload your first image</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((url, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video relative overflow-hidden group">
                  <Image
                    className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-105"
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    quality={85}
                  />
                </div>
                
                <div className="p-4">
                  <button
                    onClick={() => copyToClipboard(url, index)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      copiedIndex === index
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;