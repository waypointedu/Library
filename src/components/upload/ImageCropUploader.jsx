import React, { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

/**
 * ImageCropUploader
 * Props:
 *   value       - current image URL
 *   onChange    - called with new URL after upload
 *   shape       - 'circle' | 'rect'
 *   aspectRatio - e.g. 16/9 (used for rect)
 *   label       - optional label
 */
export default function ImageCropUploader({ value, onChange, shape = 'rect', aspectRatio = 16 / 9, label }) {
  const [localSrc, setLocalSrc] = useState(null);
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 }); // natural px
  const [zoom, setZoom] = useState(1);       // multiplier on top of "fit" scale
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // pixels in DISPLAY space
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Fixed display canvas size
  const DISPLAY_W = 480;
  const DISPLAY_H = shape === 'circle' ? 480 : Math.round(DISPLAY_W / aspectRatio);

  // "fit" scale: smallest scale that makes image cover the display canvas
  const fitScale = useCallback(() => {
    return Math.max(DISPLAY_W / imgSize.w, DISPLAY_H / imgSize.h);
  }, [imgSize, DISPLAY_W, DISPLAY_H]);

  // Total display scale = fitScale * zoom
  const dispScale = useCallback(() => fitScale() * zoom, [fitScale, zoom]);

  // Clamp offset so image always covers the canvas
  const clamp = useCallback((ox, oy, ds) => {
    const iw = imgSize.w * ds;
    const ih = imgSize.h * ds;
    const maxX = Math.max(0, (iw - DISPLAY_W) / 2);
    const maxY = Math.max(0, (ih - DISPLAY_H) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, ox)),
      y: Math.max(-maxY, Math.min(maxY, oy)),
    };
  }, [imgSize, DISPLAY_W, DISPLAY_H]);

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

  // Mouse drag
  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const raw = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
    setOffset(clamp(raw.x, raw.y, dispScale()));
  }, [dragging, dragStart, dispScale, clamp]);
  const onMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove]);

  // Touch drag
  const dragStartTouch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStartTouch.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    const raw = { x: t.clientX - dragStartTouch.current.x, y: t.clientY - dragStartTouch.current.y };
    setOffset(clamp(raw.x, raw.y, dispScale()));
  };

  // Scroll to zoom
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(z => {
      const next = Math.max(1, Math.min(5, z + delta));
      const nextDs = fitScale() * next;
      setOffset(prev => clamp(prev.x, prev.y, nextDs));
      return next;
    });
  };

  // Crop and upload — uses the same math as the live preview
  const cropAndUpload = async () => {
    setUploading(true);

    const ds = dispScale();

    // In display space: top-left corner of the image
    const imgLeft = DISPLAY_W / 2 - (imgSize.w * ds) / 2 + offset.x;
    const imgTop  = DISPLAY_H / 2 - (imgSize.h * ds) / 2 + offset.y;

    // The visible display area in image-natural coordinates:
    // srcX/Y = how many natural pixels from the image's top-left are cropped off
    const srcX = -imgLeft / ds;
    const srcY = -imgTop  / ds;
    const srcW =  DISPLAY_W / ds;
    const srcH =  DISPLAY_H / ds;

    // Output canvas at 2× for crispness
    const OUT_W = DISPLAY_W * 2;
    const OUT_H = DISPLAY_H * 2;

    const canvas = document.createElement('canvas');
    canvas.width  = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d');

    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(OUT_W / 2, OUT_H / 2, OUT_W / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const img = new Image();
    img.src = localSrc;
    await new Promise(r => { img.onload = r; });

    // drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT_W, OUT_H);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
      setLocalSrc(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setUploading(false);
    }, 'image/jpeg', 0.92);
  };

  const cancel = () => {
    setLocalSrc(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const ds = dispScale();

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}

      {localSrc ? (
        <div className="space-y-3">
          {/* Live preview — exactly what will be cropped */}
          <div
            ref={containerRef}
            className="relative overflow-hidden bg-slate-800 cursor-grab active:cursor-grabbing select-none mx-auto"
            style={{
              width: DISPLAY_W,
              maxWidth: '100%',
              height: DISPLAY_H,
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
              src={localSrc}
              alt=""
              onLoad={e => setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
              style={{
                position: 'absolute',
                width:  imgSize.w * ds,
                height: imgSize.h * ds,
                left: '50%',
                top:  '50%',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              draggable={false}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => setZoom(z => { const n = Math.max(1, z - 0.1); setOffset(prev => clamp(prev.x, prev.y, fitScale() * n)); return n; })} className="p-1 rounded hover:bg-slate-100">
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <input
              type="range" min="100" max="500" value={Math.round(zoom * 100)}
              onChange={e => {
                const n = e.target.value / 100;
                setZoom(n);
                setOffset(prev => clamp(prev.x, prev.y, fitScale() * n));
              }}
              className="w-32 accent-[#1e3a5f]"
            />
            <button onClick={() => setZoom(z => { const n = Math.min(5, z + 0.1); setOffset(prev => clamp(prev.x, prev.y, fitScale() * n)); return n; })} className="p-1 rounded hover:bg-slate-100">
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs text-slate-400 w-10">{Math.round(zoom * 100)}%</span>
          </div>
          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
            <Move className="w-3 h-3" /> Drag to reposition · scroll or slider to zoom
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
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
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
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}