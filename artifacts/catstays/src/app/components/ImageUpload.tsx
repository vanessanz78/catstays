import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface ImageUploadProps {
  value: string;
  onChange: (url: string, meta?: ImageChangeMeta) => void;
  label?: string;
  className?: string;
}

interface ImageChangeMeta {
  owned?: boolean;
  sourceUrl?: string;
  storagePath?: string;
}

export function ImageUpload({ value, onChange, label, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCopyingUrl, setIsCopyingUrl] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4cdbd524/upload-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onChange(data.url, { owned: true, storagePath: data.path });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = async () => {
    const sourceUrl = urlInput.trim();
    if (!sourceUrl) return;
    if (!/^https?:\/\//i.test(sourceUrl)) {
      alert('Please enter a full image URL starting with https://');
      return;
    }

    setIsCopyingUrl(true);

    try {
      const response = await fetch('/api/website/copy-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: sourceUrl }),
      });

      if (!response.ok) {
        throw new Error('Image copy failed');
      }

      const data = await response.json() as { url?: string; path?: string };
      if (!data.url) {
        throw new Error('Image copy did not return a URL');
      }

      onChange(data.url, { owned: true, sourceUrl, storagePath: data.path });
      setUrlInput('');
      setShowUrlInput(false);
    } catch (error) {
      console.error('Error copying linked image:', error);
      alert('CatStays could not copy that image into storage yet. Please try another image URL or upload the image file so the published site does not rely on the original website.');
    } finally {
      setIsCopyingUrl(false);
    }
  };

  const handleRemove = () => {
    onChange('', { owned: false });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUrlInput(!showUrlInput)}
              disabled={isCopyingUrl}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                disabled={isCopyingUrl}
              />
              <Button onClick={handleUrlSubmit} size="sm" disabled={isCopyingUrl}>
                {isCopyingUrl ? 'Copying...' : 'Add'}
              </Button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
