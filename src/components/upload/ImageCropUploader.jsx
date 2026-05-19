import React, { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

/**
 * ImageCropUploader
 * Props:
 *   value         - current image URL
 *   onChange      - called with new URL after upload
 *   shape         - 'circle' | 'rect' (default 'rect')
 *   aspectRatio   - e.g. 16/9 for rect (ignored for circle)
 *   label         - optional label text
 */
export default function ImageCropUploader({ value, onChange, shape = 'rect', aspectRatio = 16 / 9, label }) {
  const [localSrc, setLocalSrc] = useState(null); // raw file data URL for preview/crop
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const CANVAS_W = 480;
  const CANVAS_H = shape === 'circle' ? 480 : Math.round(CANVAS_W / aspectRatio);
  const OUTPUT_W = shape === 'circle' ? 400 : 960;
  const OUTPUT_H = shape === 'circle' ? 400 : Math.round(OUTPUT_W / aspectRatio);

  const imgRef = useRef(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });

  // Compute base scale so the image covers the canvas at zoom=1
  const baseScale = useCallback(() => {
    const { w, h } = imgNaturalSize;
    return Math.max(CANVAS_W / w, CANVAS_H / h);
  }, [imgNaturalSize, CANVAS_W, CANVAS_H]);

  const clampOffset = useCallback((ox, oy, scale) => {
    const { w, h } = imgNaturalSize;
    const iw = w * scale;
    const ih = h * scale;
    const maxX = Math.max(0, (iw - CANVAS_W) / 2);
    const maxY = Math.max(0, (ih - CANVAS_H) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, ox)), y: Math.max(-maxY, Math.min(maxY, oy)) };
  }, [imgNaturalSize, CANVAS_W, CANVAS_H]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      setLocalSrc(e.target.result);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const scale = baseScale() * zoom;
    const raw = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    setOffset(clampOffset(raw.x, raw.y, scale));
  }, [dragging, dragStart, zoom, baseScale, clampOffset]);

  const onMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove]);

  // Touch support
  const touchStartRef = useRef({ x: 0, y: 0 });
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    touchStartRef.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  };
  const onTouchMove = (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const scale = baseScale() * zoom;
    const raw = { x: t.clientX - dragStart.x, y: t.clientY - dragStart.y };
    setOffset(clampOffset(raw.x, raw.y, scale));
  };

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(z => {
      const next = Math.max(0.5, Math.min(4, z + delta));
      const scale = baseScale() * next;
      setOffset(prev => clampOffset(prev.x, prev.y, scale));
      return next;
    });
  };

  const cropAndUpload = async () => {
    setUploading(true);
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext('2d');

    const scale = baseScale() * zoom;
    const { w, h } = imgNaturalSize;
    const iw = w * scale;
    const ih = h * scale;

    // top-left of image in canvas coords
    const imgLeft = CANVAS_W / 2 - iw / 2 + offset.x;
    const imgTop = CANVAS_H / 2 - ih / 2 + offset.y;

    // scale factor from preview canvas to output canvas
    const scaleX = OUTPUT_W / CANVAS_W;
    const scaleY = OUTPUT_H / CANVAS_H;

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(OUTPUT_W / 2, OUTPUT_H / 2, OUTPUT_W / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const img = new Image();
    img.src = localSrc;
    await new Promise(r => { img.onload = r; });
    ctx.drawImage(img, imgLeft * scaleX, imgTop * scaleY, iw * scaleX, ih * scaleY);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      setLocalSrc(null);
      setUploading(false);
    }, 'image/jpeg', 0.92);
  };

  const cancel = () => {
    setLocalSrc(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const scale = baseScale() * zoom;
  const iw = imgNaturalSize.w * scale;
  const ih = imgNaturalSize.h * scale;

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}

      {/* Cropper UI */}
      {localSrc ? (
        <div className="space-y-3">
          <div
            ref={containerRef}
            className="relative overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing select-none mx-auto"
            style={{
              width: CANVAS_W,
              maxWidth: '100%',
              height: CANVAS_H,
              borderRadius: shape === 'circle' ? '50%' : '0.5rem',
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setDragging(false)}
            onWheel={onWheel}
            onDragOver={e => e.preventDefault()}
          >
            <img
              ref={imgRef}
              src={localSrc}
              alt=""
              onLoad={e => {
                setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
              }}
              style={{
                position: 'absolute',
                width: iw,
                height: ih,
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              draggable={false}
            />
            {/* Crosshair hint */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white/30 rounded-full w-8 h-8" />
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 rounded hover:bg-slate-100">
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <input
              type="range" min="50" max="400" value={Math.round(zoom * 100)}
              onChange={e => {
                const z = e.target.value / 100;
                setZoom(z);
                setOffset(prev => clampOffset(prev.x, prev.y, baseScale() * z));
              }}
              className="w-32 accent-[#1e3a5f]"
            />
            <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="p-1 rounded hover:bg-slate-100">
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs text-slate-400 w-10">{Math.round(zoom * 100)}%</span>
          </div>
          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
            <Move className="w-3 h-3" /> Drag to reposition · scroll to zoom
          </p>

          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={cropAndUpload} disabled={uploading} className="bg-[#1e3a5f]">
              <Check className="w-4 h-4 mr-1" />{uploading ? 'Uploading...' : 'Use this crop'}
            </Button>
            <Button size="sm" variant="outline" onClick={cancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={value}
                alt="Current"
                className={`object-cover ${shape === 'circle' ? 'w-24 h-24 rounded-full' : 'w-full h-40 rounded-lg'}`}
              />
              <p className="text-xs text-slate-500">Click or drag to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload className="w-8 h-8" />
              <p className="text-sm">Click or drag & drop an image</p>
              <p className="text-xs">PNG, JPG, WEBP</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
}