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
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 400, h: 225 });

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  // Measure the actual rendered container size
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setContainerSize({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [localSrc]); // re-run when crop UI mounts

  const CW = containerSize.w;
  const CH = containerSize.h;

  const fitScale = useCallback(() => {
    if (!naturalSize.w || !naturalSize.h) return 1;
    return Math.max(CW / naturalSize.w, CH / naturalSize.h);
  }, [naturalSize, CW, CH]);

  const totalScale = useCallback(() => fitScale() * zoom, [fitScale, zoom]);

  const clamp = useCallback((ox, oy, ts) => {
    const iw = naturalSize.w * ts;
    const ih = naturalSize.h * ts;
    const maxX = Math.max(0, (iw - CW) / 2);
    const maxY = Math.max(0, (ih - CH) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, ox)),
      y: Math.max(-maxY, Math.min(maxY, oy)),
    };
  }, [naturalSize, CW, CH]);

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

  const onImgLoad = (e) => {
    setNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
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
    setOffset(clamp(raw.x, raw.y, totalScale()));
  }, [dragging, dragStart, totalScale, clamp]);
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
    dragStartTouch.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    const raw = { x: t.clientX - dragStartTouch.current.x, y: t.clientY - dragStartTouch.current.y };
    setOffset(clamp(raw.x, raw.y, totalScale()));
  };

  // Scroll to zoom
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(z => {
      const next = Math.max(1, Math.min(5, z + delta));
      const nextTs = fitScale() * next;
      setOffset(prev => clamp(prev.x, prev.y, nextTs));
      return next;
    });
  };

  // Crop and upload — uses the exact same display values as the preview
  const cropAndUpload = async () => {
    setUploading(true);

    const ts = totalScale();

    // Top-left of image in display space
    const imgLeft = CW / 2 - (naturalSize.w * ts) / 2 + offset.x;
    const imgTop  = CH / 2 - (naturalSize.h * ts) / 2 + offset.y;

    // Source rectangle in natural image pixels
    const srcX = -imgLeft / ts;
    const srcY = -imgTop  / ts;
    const srcW =  CW / ts;
    const srcH =  CH / ts;

    // Output at 2× for crispness
    const OUT_W = Math.round(CW * 2);
    const OUT_H = Math.round(CH * 2);

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
    await new Promise(r => { img.onload = r; if (img.complete) r(); });

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

  const ts = totalScale();

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}

      {localSrc ? (
        <div className="space-y-3">
          {/* Preview container — CSS aspect-ratio keeps it the right shape always */}
          <div
            ref={containerRef}
            className="relative overflow-hidden bg-slate-800 cursor-grab active:cursor-grabbing select-none w-full"
            style={{
              aspectRatio: shape === 'circle' ? '1 / 1' : `${aspectRatio} / 1`,
              borderRadius: shape === 'circle' ? '50%' : '0.5rem',
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setDragging(false)}
            onWheel={onWheel}
          >
            {naturalSize.w > 0 && (
              <img
                src={localSrc}
                alt=""
                style={{
                  position: 'absolute',
                  width:  naturalSize.w * ts,
                  height: naturalSize.h * ts,
                  left: '50%',
                  top:  '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                draggable={false}
              />
            )}
            {/* Hidden img just to get natural size */}
            <img
              src={localSrc}
              alt=""
              onLoad={onImgLoad}
              style={{ display: 'none' }}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={() => setZoom(z => { const n = Math.max(1, z - 0.1); setOffset(prev => clamp(prev.x, prev.y, fitScale() * n)); return n; })}
              className="p-1 rounded hover:bg-slate-100"
            >
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
            <button
              onClick={() => setZoom(z => { const n = Math.min(5, z + 0.1); setOffset(prev => clamp(prev.x, prev.y, fitScale() * n)); return n; })}
              className="p-1 rounded hover:bg-slate-100"
            >
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