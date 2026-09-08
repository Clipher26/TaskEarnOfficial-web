"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Check, X, Move } from "lucide-react";

interface BoundingBoxAnnotatorProps {
  submissionId: string;
  imageUrl: string;
  onComplete: () => void;
}

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export const BoundingBoxAnnotator: React.FC<BoundingBoxAnnotatorProps> = ({ submissionId, imageUrl, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<Box | null>(null);
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl, boxes]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const allBoxes = [...boxes];
    if (currentBox) allBoxes.push(currentBox);

    allBoxes.forEach((box) => {
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
      ctx.fillRect(box.x, box.y, box.width, box.height);

      if (box.label) {
        ctx.font = "14px sans-serif";
        const textWidth = ctx.measureText(box.label).width;
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(box.x, box.y - 20, textWidth + 8, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(box.label, box.x + 4, box.y - 6);
      }
    });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    setCurrentBox({
      id: "temp",
      x: Math.min(startPos.x, coords.x),
      y: Math.min(startPos.y, coords.y),
      width: Math.abs(coords.x - startPos.x),
      height: Math.abs(coords.y - startPos.y),
      label: "",
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentBox && currentBox.width > 5 && currentBox.height > 5) {
      setBoxes((prev) => [...prev, currentBox]);
    }
    setCurrentBox(null);
  };

  useEffect(() => {
    drawCanvas();
  }, [boxes, currentBox, imageLoaded]);

  const removeBox = (id: string) => {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  const submitAnnotations = async () => {
    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

      await fetch(`${API_BASE_URL}/api/tasks/annotation/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: submissionId,
          annotation_data: boxes.map((b) => ({ x: b.x, y: b.y, width: b.width, height: b.height, label: b.label })),
          image_url: imageUrl,
        }),
      });

      onComplete();
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Draw bounding boxes around objects in the image</p>
        <span className="text-xs text-slate-500">{boxes.length} boxes</span>
      </div>

      <div className="relative overflow-auto bg-slate-900 rounded-xl border border-slate-700">
        {!imageLoaded && <div className="flex items-center justify-center h-48 text-slate-500 text-xs">Loading image...</div>}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full h-auto cursor-crosshair ${imageLoaded ? "" : "hidden"}`}
        />
      </div>

      {boxes.length > 0 && (
        <div className="space-y-2">
          {boxes.map((box) => (
            <div key={box.id} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <Move size={12} className="text-indigo-400" />
                <span className="text-xs text-slate-300">
                  {box.label || "Unlabeled"} - {Math.round(box.width)}x{Math.round(box.height)}
                </span>
              </div>
              <button onClick={() => removeBox(box.id)} className="text-slate-400 hover:text-rose-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label for next box (optional)"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => {
            if (currentBox) {
              setBoxes((prev) => prev.map((b) => (b.id === currentBox.id ? { ...b, label } : b)));
              setCurrentBox(null);
              setLabel("");
            }
          }}
          disabled={!currentBox}
          className="px-3 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
        >
          Label
        </button>
      </div>

      <button
        onClick={submitAnnotations}
        disabled={isSubmitting || boxes.length === 0}
        className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-95 transition-all text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check size={14} />
            Submit Annotations ({boxes.length})
          </>
        )}
      </button>
    </div>
  );
};
