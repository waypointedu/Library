import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';

export default function FileUploader({ onUploadComplete, accept, label, lang = 'en', value }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(value || null);
  const [fileName, setFileName] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      if (onUploadComplete) onUploadComplete(file_url, file.name);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const t = { en: { upload: 'Upload', remove: 'Remove' }, es: { upload: 'Subir', remove: 'Eliminar' } };
  const text = t[lang] || t.en;

  return (
    <div>
      {label && <p className="text-sm font-medium mb-1">{label}</p>}
      {uploadedUrl ? (
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
          <span className="text-sm text-slate-700 truncate flex-1">{fileName || uploadedUrl}</span>
          <button onClick={() => { setUploadedUrl(null); setFileName(''); if (onUploadComplete) onUploadComplete(null, null); }}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition-colors w-fit">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span className="text-sm">{text.upload}</span>
          <input type="file" className="hidden" accept={accept} onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}