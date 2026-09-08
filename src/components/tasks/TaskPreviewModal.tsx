"use client";

import React, { useState } from "react";
import { X, ExternalLink, Image as ImageIcon } from "lucide-react";
import { TaskPreview } from "@/lib/types";

interface TaskPreviewModalProps {
  previews: TaskPreview[];
  onClose: () => void;
}

export const TaskPreviewModal: React.FC<TaskPreviewModalProps> = ({ previews, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (previews.length === 0) return null;

  const current = previews[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card-strong w-full max-w-md p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white">Task Preview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="relative aspect-video bg-slate-900">
          {current.preview_url ? (
            <img src={current.preview_url} alt={current.caption || "Preview"} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon size={48} className="text-slate-600" />
            </div>
          )}
          {current.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-xs text-white/90">{current.caption}</p>
            </div>
          )}
        </div>

        {previews.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {previews.map((preview, idx) => (
              <button
                key={preview.id}
                onClick={() => setActiveIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeIndex ? "border-indigo-400" : "border-transparent opacity-60"
                }`}
              >
                <img src={preview.preview_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ExternalLink size={12} />
            <span>Preview type: {current.preview_type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
