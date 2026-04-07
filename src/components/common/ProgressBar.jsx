import React from 'react';

export default function ProgressBar({ value, className = "" }) {
  return (
    <div className={`w-full bg-slate-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
      />
    </div>
  );
}