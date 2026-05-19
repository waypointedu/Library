import React, { useState, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload, ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

// Fixed crop window size (in px). The image is shown at full width around it.
const CROP_W = 400;
const getcropH = (shape, aspectRatio) => shape === 'circle' ? 400 : Math.round(CROP_W / aspectRatio);

export default function ImageCropUploader({ value, onChange, shape = 'rect', aspectRatio = 16 / 9, label }) {
  const [localSrc, setLocalSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const stageRef = useRef(null); // the full editing area
  const [stageSize, setStageSize] = useState({ w: 600, h: 400 });

  const CROP_H = getcropH(shape, aspectRatio);

  // Measure stage width so the image fills it
  useEffect(() => {
    if (!stageRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 0) {
        // Stage height = crop height + some padding
        setStageSize({ w: width, h: CROP_H + 60 });
      }
    });
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [localSrc, CROP_H]);

  const SW = stageSize.w;
  const SH = stageSize.h;

  // "fit" scale: image fills the crop box at minimum
  const fitScale = useCallback(() => {
    if (!naturalSize.w || !naturalSize.h) return 1;
    return Math.max(CROP_W / naturalSize.w, CROP_H / naturalSize.h);
  }, [naturalSize, CROP_W, CROP_H]);

  const totalScale = useCallback(() => fitScale() * zoom, [fitScale, zoom]);

  // Clamp so image always covers the crop window
  const clamp = useCallback((ox, oy, ts) => {
    const iw = naturalSize.w * ts;
    const ih = naturalSize.h * ts;
    // Image center relative to stage center must keep crop box covered
    const maxX = Math.max(0, (iw - CROP_W) / 2);
    const maxY = Math.max(0, (ih - CROP_H) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, ox)),
      y: Math.max(-maxY, Math.min(maxY, oy)),
    };
  }, [naturalSize, CROP_W, CROP_H]);

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

  // Mouse drag on stage
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
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove]);

  // Touch
  const dragStartTouch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e) => {
    const t = e.touches[0];
    dragStartTouch.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    setOffset(clamp(t.clientX - dragStartTouch.current.x, t.clientY - dragStartTouch.current.y, totalScale()));
  };

  // Scroll zoom
  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(z => {
      const next = Math.max(1, Math.min(5, z + delta));
      setOffset(prev => clamp(prev.x, prev.y, fitScale() * next));
      return next;
    });
  };

  const changeZoom = (next) => {
    next = Math.max(1, Math.min(5, next));
    setZoom(next);
    setOffset(prev => clamp(prev.x, prev.y, fitScale() * next));
  };

  // Crop & upload: srcX/Y/W/H are in natural image pixels matching the crop window
  const cropAndUpload = async () => {
    setUploading(true);
    const ts = totalScale();
    // Image drawn centered on stage + offset
    const imgLeft = SW / 2 - (naturalSize.w * ts) / 2 + offset.x;
    const imgTop  = SH / 2 - (naturalSize.h * ts) / 2 + offset.y;
    // Crop window top-left in stage coords
    const cropLeft = (SW - CROP_W) / 2;
    const cropTop  = (SH - CROP_H) / 2;
    // Source in natural pixels
    const srcX = (cropLeft - imgLeft) / ts;
    const srcY = (cropTop  - imgTop)  / ts;
    const srcW = CROP_W / ts;
    const srcH = CROP_H / ts;

    const OUT_W = CROP_W * 2;
    const OUT_H = CROP_H * 2;
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
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

  const cancel = () => { setLocalSrc(null); setZoom(1); setOffset({ x: 0, y: 0 }); };

  const ts = totalScale();

  // Dim overlay: 4 rectangles around the crop box
  const cropLeft = (SW - CROP_W) / 2;
  const cropTop  = (SH - CROP_H) / 2;

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium text-slate-700 block">{label}</label>}

      {localSrc ? (
        <div className="space-y-3">
          {/* Stage: full-width, image floats behind crop overlay */}
          <div
            ref={stageRef}
            className="relative overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing select-none rounded-lg"
            style={{ width: '100%', height: SH }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setDragging(false)}
            onWheel={onWheel}
          >
            {/* The image */}
            {naturalSize.w > 0 && (
              <img
                src={localSrc}
                alt=""
                style={{
                  position: 'absolute',
                  width: naturalSize.w * ts,
                  height: naturalSize.h * ts,
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                draggable={false}
              />
            )}

            {/* Dim overlay — 4 panels around the crop box */}
            {naturalSize.w > 0 && (<>
              {/* top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: cropTop, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
              {/* bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: cropTop + CROP_H, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
              {/* left */}
              <div style={{ position: 'absolute', top: cropTop, left: 0, width: cropLeft, height: CROP_H, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
              {/* right */}
              <div style={{ position: 'absolute', top: cropTop, left: cropLeft + CROP_W, right: 0, height: CROP_H, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
              {/* Crop border */}
              <div style={{
                position: 'absolute',
                top: cropTop, left: cropLeft,
                width: CROP_W, height: CROP_H,
                border: '2px dashed rgba(255,255,255,0.8)',
                borderRadius: shape === 'circle' ? '50%' : 6,
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }} />
            </>)}

            {/* Hidden img to read natural size */}
            <img src={localSrc} alt="" onLoad={onImgLoad} style={{ display: 'none' }} />
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-3 justify-center">
            <button onClick={() => changeZoom(zoom - 0.1)} className="p-1 rounded hover:bg-slate-100">
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <input
              type="range" min="100" max="500" value={Math.round(zoom * 100)}
              onChange={e => changeZoom(e.target.value / 100)}
              className="w-32 accent-[#1e3a5f]"
            />
            <button onClick={() => changeZoom(zoom + 0.1)} className="p-1 rounded hover:bg-slate-100">
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
              <img src={value} alt="Current" className={`object-cover ${shape === 'circle' ? 'w-24 h-24 rounded-full' : 'w-full h-40 rounded-lg'}`} />
              <p className="text-xs text-slate-500">Click or drag to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload className="w-8 h-8" />
              <p className="text-sm">Click or drag & drop an image</p>
              <p className="text-xs">PNG, JPG, WEBP</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}