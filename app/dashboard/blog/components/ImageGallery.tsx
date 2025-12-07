import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Copy, Check, Trash2, Eye, Grid, List, Image } from 'lucide-react';

interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  uploadedAt: string;
  size?: number;
}

interface ImageGalleryProps {
  onUploadImageAction?: (formData: FormData) => Promise<{ 
    success: boolean; 
    message?: string; 
    url?: string;
    data?: { path?: string } | null;
  }>;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onUploadImageAction, className = '' }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const STORAGE_KEY = 'blog-image-urls';

  // Load images from localStorage on component mount
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem(STORAGE_KEY);
      if (savedImages && savedImages !== 'undefined' && savedImages !== 'null') {
        const parsedImages = JSON.parse(savedImages);
        if (Array.isArray(parsedImages)) {
          console.log('Loaded images from localStorage:', parsedImages.length);
          setImages(parsedImages);
        }
      }
    } catch (error) {
      console.error('Error loading saved images:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save images to localStorage whenever images array changes (but not on initial load)
  useEffect(() => {
    // Only save if images array is not empty or if we're explicitly clearing
    if (images.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
        console.log('Saved images to localStorage:', images.length);
      } catch (error) {
        console.error('Error saving images to localStorage:', error);
      }
    }
  }, [images]);

  // Enhanced upload function that handles both real uploads and local file display
  const handleImageUpload = async (formData: FormData): Promise<{ 
    success: boolean; 
    message?: string; 
    url?: string;
    data?: { path?: string } | null;
  }> => {
    const file = formData.get('image') as File;
    if (!file) {
      return { success: false, message: 'No file provided' };
    }

    // If there's a custom upload function, try to use it first
    if (onUploadImageAction) {
      try {
        const result = await onUploadImageAction(formData);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('Custom upload function failed, falling back to local display:', error);
      }
    }

    // Fallback: Create local object URL for immediate display
    // This is useful for development or when no server upload is available
    const objectUrl = URL.createObjectURL(file);
    
    return { 
      success: true, 
      message: 'Image loaded successfully (stored URL locally)', 
      data: { path: objectUrl }
    };
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    // Reset previous messages
    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const result = await handleImageUpload(formData);

      if (result.success && (result.url || result.data?.path)) {
        const imageUrl = result.url || result.data?.path!;
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: imageUrl,
          filename: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size
        };

        setImages(prev => {
          const newImages = [newImage, ...prev];
          // Save to localStorage immediately
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
            console.log('Saved new image to localStorage');
          } catch (error) {
            console.error('Error saving new image to localStorage:', error);
          }
          return newImages;
        });
        setUploadSuccess((result.message || 'Image uploaded successfully!') + ' - URL saved to localStorage');
        
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

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const copyMarkdownImage = async (image: UploadedImage) => {
    const markdownText = `![${image.filename}](${image.url})`;
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopiedUrl(image.url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy markdown:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = markdownText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(image.url);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  const deleteImage = (id: string) => {
    const imageToDelete = images.find(img => img.id === id);
    if (imageToDelete && imageToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToDelete.url);
    }
    
    const newImages = images.filter(img => img.id !== id);
    setImages(newImages);
    
    // Update localStorage immediately
    try {
      if (newImages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      console.log('Updated localStorage after deleting image');
    } catch (error) {
      console.error('Error updating localStorage after delete:', error);
    }
    
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const clearAllImages = () => {
    if (window.confirm('Are you sure you want to clear all saved images?')) {
      // Clean up any blob URLs
      images.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
      
      // Clear state first
      setImages([]);
      setSelectedImage(null);
      
      // Then clear localStorage
      try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Cleared all images from localStorage');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  };

  const dismissMessage = (type: 'success' | 'error') => {
    if (type === 'success') {
      setUploadSuccess(null);
    } else {
      setUploadError(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageError = (image: UploadedImage, imgElement: HTMLImageElement) => {
    console.error('Image failed to load:', image.url);
    
    // Fallback to placeholder
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEzVjNIMTJMMTAgMUg0QTIgMiAwIDAgMCAyIDNWMTNBMiAyIDAgMCAwIDQgMTVIMTlBMiAyIDAgMCAwIDIxIDEzWiIgZmlsbD0iI0Y3RjdGNyIgc3Ryb2tlPSIjRDFEMUQxIiBzdHJva2Utd2lkdGg9IjEiLz4KPHBhdGggZD0iTTkgMTBBMiAyIDAgMSAwIDcgOEEyIDIgMCAwIDAgOSAxMFoiIGZpbGw9IiNEMUQxRDEiLz4KPHBhdGggZD0iTTIxIDEzTDE2IDhMMTMgMTFMOSA3TDQgMTNIMjFaIiBmaWxsPSIjRDFEMUQxIi8+Cjwvc3ZnPgo=';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 font-medium">Image Gallery</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {images.length} images
            </span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              URLs saved locally ({localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').length : 0} stored)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            {images.length > 0 && (
              <button
                onClick={clearAllImages}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Clear all images"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleFileSelect}
            disabled={uploading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>Upload Image</span>
              </>
            )}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="text-sm text-gray-500">
            Supported formats: JPG, PNG, GIF, WebP (Max 10MB) • URLs persist until you clear them
          </div>
        </div>

        {/* Messages */}
        {uploadSuccess && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span className="text-green-800 text-sm">{uploadSuccess}</span>
            </div>
            <button
              onClick={() => dismissMessage('success')}
              className="text-green-600 hover:text-green-800"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {uploadError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <X className="text-red-600" size={16} />
              <span className="text-red-800 text-sm">{uploadError}</span>
            </div>
            <button
              onClick={() => dismissMessage('error')}
              className="text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Images List */}
      <div className="p-4">
        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No images uploaded yet</p>
            <p className="text-sm">Upload your first image to get started</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
            {images.map((image) => (
              <div
                key={image.id}
                className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center gap-4 p-3' : 'bg-white'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setSelectedImage(image)}
                        onError={(e) => handleImageError(image, e.currentTarget)}
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-medium text-gray-800 truncate mb-1">
                        {image.filename}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(image.uploadedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(image.url)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs transition-colors"
                          title="Copy URL"
                        >
                          {copiedUrl === image.url ? (
                            <Check className="w-3 h-3 mx-auto" />
                          ) : (
                            <Copy className="w-3 h-3 mx-auto" />
                          )}
                        </button>
                        <button
                          onClick={() => copyMarkdownImage(image)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 px-2 py-1 rounded text-xs transition-colors"
                          title="Copy Markdown"
                        >
                          MD
                        </button>
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-xs transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                        onError={(e) => handleImageError(image, e.currentTarget)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{image.filename}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(image.uploadedAt).toLocaleDateString()}
                        {image.size && ` • ${formatFileSize(image.size)}`}
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-1" title={image.url}>
                        {image.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm transition-colors"
                        title="Copy URL"
                      >
                        {copiedUrl === image.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyMarkdownImage(image)}
                        className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded text-sm transition-colors"
                        title="Copy Markdown"
                      >
                        MD
                      </button>
                      <button
                        onClick={() => deleteImage(image.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded text-sm transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{selectedImage.filename}</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
                onError={(e) => handleImageError(selectedImage, e.currentTarget)}
              />
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(selectedImage.url)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  {copiedUrl === selectedImage.url ? (
                    <>
                      <Check className="w-4 h-4 inline mr-2" />
                      Copied URL
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 inline mr-2" />
                      Copy URL
                    </>
                  )}
                </button>
                <button
                  onClick={() => copyMarkdownImage(selectedImage)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Copy Markdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;