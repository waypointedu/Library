import React, { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, Move } from 'lucide-react';

/**
 * ImageCropUploader — upload image, then drag to reposition within the frame.
 * Props:
 *   value            - current image URL
 *   onChange         - called with new URL after upload
 *   position         - CSS object-position string, e.g. "50% 30%" (optional)
 *   onPositionChange - called with new position string when user drags (optional)
 *   shape            - 'circle' | 'rect'
 *   aspectRatio      - e.g. 16/9
 *   label            - optional label string
 */
export default function ImageCropUploader({
  value,
  onChange,
  position = '50% 50%',
  onPositionChange,
  shape = 'rect',
  aspectRatio = 16 / 9,
  label,
}) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // pos is stored as {x: 0..100, y: 0..100} percentages
  const [pos, setPos] = useState(() => parsePosition(position));
  const dragStart = useRef(null);
  const frameRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync external position prop
  useEffect(() => { setPos(parsePosition(position)); }, [position]);

  function parsePosition(str) {
    if (!str) return { x: 50, y: 50 };
    const parts = str.split(' ');
    return {
      x: parseFloat(parts[0]) || 50,
      y: parseFloat(parts[1]) || 50,
    };
  }

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    // Reset position to center on new upload
    const newPos = { x: 50, y: 50 };
    setPos(newPos);
    if (onPositionChange) onPositionChange('50% 50%');
    setUploading(false);
  };

  // Drag to reposition
  const onMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  const onMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    // Moving image left means focal point moves right (inverted), scale by frame size
    const newX = Math.max(0, Math.min(100, dragStart.current.px - (dx / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, dragStart.current.py - (dy / rect.height) * 100));
    setPos({ x: newX, y: newY });
    if (onPositionChange) onPositionChange(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
  }, [isDragging, onPositionChange]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Touch support
  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
  };
  const onTouchMove = (e) => {
    if (!touchStart.current || !frameRef.current) return;
    const t = e.touches[0];
    const rect = frameRef.current.getBoundingClientRect();
    const dx = t.clientX - touchStart.current.mx;
    const dy = t.clientY - touchStart.current.my;
    const newX = Math.max(0, Math.min(100, touchStart.current.px - (dx / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, touchStart.current.py - (dy / rect.height) * 100));
    setPos({ x: newX, y: newY });
    if (onPositionChange) onPositionChange(`${newX.toFixed(1)}% ${newY.toFixed(1)}%`);
  };

  const containerStyle = {
    aspectRatio: shape === 'circle' ? '1 / 1' : `${aspectRatio} / 1`,
    borderRadius: shape === 'circle' ? '50%' : '0.5rem',
    overflow: 'hidden',
    position: 'relative',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}

      {value ? (
        <div className="space-y-2">
          {/* Positioned image preview — drag to reposition */}
          <div
            ref={frameRef}
            style={containerStyle}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => { touchStart.current = null; }}
          >
            <img
              src={value}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${pos.x}% ${pos.y}%`,
                pointerEvents: 'none',
                userSelect: 'none',
                display: 'block',
              }}
              draggable={false}
            />
            {/* Drag hint overlay */}
            <div
              style={{
                position: 'absolute', inset: 0,
                border: '2px dashed rgba(255,255,255,0.6)',
                borderRadius: 'inherit',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                background: 'rgba(0,0,0,0.45)',
                color: '#fff',
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                pointerEvents: 'none',
              }}>
                <Move style={{ width: 12, height: 12 }} /> Drag to reposition
              </span>
            </div>
          </div>

          {/* Replace button */}
          <div className="flex items-center gap-2">
            <button
              className="text-xs text-slate-500 hover:text-slate-800 underline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Replace image'}
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload className="w-8 h-8" />
              <p className="text-sm">Click or drag & drop an image</p>
              <p className="text-xs">PNG, JPG, WEBP</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />
        </div>
      )}
    </div>
  );
}