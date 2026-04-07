import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

export default function ImageUploader({ value, onChange, label = "Image" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG or JPEG image');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      {value ? (
        <div className="mt-2">
          <div className="relative inline-block">
            <img src={value} alt="Preview" className="max-h-32 rounded-lg border border-slate-200" />
            <button onClick={() => onChange('')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-sm text-slate-500">{isUploading ? 'Uploading...' : 'Click to upload image'}</span>
            <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      )}
      <Input
        className="mt-2"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}