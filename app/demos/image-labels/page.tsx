/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

const LABEL_COLORS: Record<string, string> = {
  OBJECT: '#3b82f6',
  PERSON: '#10b981',
  ANIMAL: '#f59e0b',
  VEHICLE: '#8b5cf6',
  CUSTOM: '#ec4899',
};

const SAMPLE_IMAGE = '/dented_car.jpeg';

export default function ImageLabelingPage() {
  const [boxes, setBoxes] = useState<BoundingBox[]>(() => {
    // Load saved boxes from session storage on mount
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('image-labels');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [showLabelPopup, setShowLabelPopup] = useState(false);
  const [pendingBox, setPendingBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [suggestedLabels] = useState(['OBJECT', 'PERSON', 'ANIMAL', 'VEHICLE']);
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const idCounterRef = useRef(0);

  // Draw all boxes on canvas
  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing boxes
    boxes.forEach((box) => {
      ctx.strokeStyle = box.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw label
      ctx.fillStyle = box.color;
      ctx.font = '14px sans-serif';
      const textWidth = ctx.measureText(box.label).width;
      ctx.fillRect(box.x, box.y - 25, textWidth + 10, 25);
      ctx.fillStyle = 'white';
      ctx.fillText(box.label, box.x + 5, box.y - 7);
    });

    // Draw current box being drawn
    if (currentBox) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.setLineDash([]);
    }
  }, [boxes, currentBox]);

  // Initialize canvas when image loads
  useEffect(() => {
    if (imageLoaded) {
      drawBoxes();
    }
  }, [drawBoxes, imageLoaded]);

  // Initialize canvas when component mounts if image is already cached
  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (image && canvas && image.complete && image.naturalWidth > 0) {
      // Image is already loaded (from cache), initialize canvas
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      // Use a microtask to avoid synchronous setState in effect
      Promise.resolve().then(() => setImageLoaded(true));
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Scale coordinates from display size to actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentBox) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Scale coordinates from display size to actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const width = currentX - currentBox.x;
    const height = currentY - currentBox.y;
    setCurrentBox({ ...currentBox, width, height });
    drawBoxes();
  };

  const handleMouseUp = () => {
    if (!currentBox || Math.abs(currentBox.width) < 10 || Math.abs(currentBox.height) < 10) {
      setIsDrawing(false);
      setCurrentBox(null);
      return;
    }

    const normalizedBox = {
      x: currentBox.width < 0 ? currentBox.x + currentBox.width : currentBox.x,
      y: currentBox.height < 0 ? currentBox.y + currentBox.height : currentBox.y,
      width: Math.abs(currentBox.width),
      height: Math.abs(currentBox.height),
    };

    setIsDrawing(false);
    setPendingBox(normalizedBox);
    setShowLabelPopup(true);
    // Keep currentBox to show the dotted preview until label is added
    setCurrentBox(normalizedBox);
  };

  const addLabel = (labelType: string) => {
    if (!pendingBox) return;
    const newBox: BoundingBox = {
      id:`label-box-${++idCounterRef.current}`,
      ...pendingBox,
      label: labelType,
      color: LABEL_COLORS[labelType] || LABEL_COLORS.CUSTOM,
    };
    setBoxes([...boxes, newBox]);
    setShowLabelPopup(false);
    setPendingBox(null);
    setCurrentBox(null); // Clear the dotted preview after adding the label
    setLabelInput('');
  };

  const addCustomLabel = () => {
    if (!labelInput.trim()) return;
    addLabel(labelInput.toUpperCase());
  };

  const cancelLabel = () => {
    setShowLabelPopup(false);
    setPendingBox(null);
    setCurrentBox(null); // Clear the preview
    setLabelInput('');
  };

  const removeBox = (id: string) => setBoxes(boxes.filter(b => b.id !== id));

  // Save boxes to session storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('image-labels', JSON.stringify(boxes));
    }
  }, [boxes]);

  // Export labeled image
  const exportImage = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!canvas || !image) return;

    // Create a temporary canvas to combine image + labels
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = image.naturalWidth;
    exportCanvas.height = image.naturalHeight;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Draw the original image
    ctx.drawImage(image, 0, 0);

    // Draw all the boxes and labels on top
    boxes.forEach((box) => {
      ctx.strokeStyle = box.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw label background
      ctx.fillStyle = box.color;
      ctx.font = '14px sans-serif';
      const textWidth = ctx.measureText(box.label).width;
      ctx.fillRect(box.x, box.y - 25, textWidth + 10, 25);

      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(box.label, box.x + 5, box.y - 7);
    });

    // Download the image
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `labeled-image-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  // Clear all annotations
  const clearAll = () => {
    if (confirm('Clear all annotations?')) {
      setBoxes([]);
      sessionStorage.removeItem('image-labels');
    }
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Set canvas internal resolution to match the actual image dimensions
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    // Setting imageLoaded will trigger the useEffect which calls drawBoxes
    setImageLoaded(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Image Labeling Demo</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click and drag on the image to draw bounding boxes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportImage}
            disabled={boxes.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Download Image
          </button>
          <button
            onClick={clearAll}
            disabled={boxes.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="relative inline-block">
          {}
          <img
            ref={imageRef}
            src={SAMPLE_IMAGE}
            alt="Sample"
            className="max-w-full h-auto rounded"
            onLoad={handleImageLoad}
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => isDrawing && handleMouseUp()}
            className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          />
        </div>

        {showLabelPopup && (
          <div className="mt-4 bg-gray-800 rounded-lg p-3 inline-flex items-center gap-2">
            <span className="text-white text-sm">Label:</span>
            {suggestedLabels.map((label) => (
              <button
                key={label}
                onClick={() => addLabel(label)}
                className="px-3 py-1.5 text-xs text-white hover:bg-gray-700 rounded"
              >
                {label}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-600" />
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomLabel();
                if (e.key === 'Escape') cancelLabel();
              }}
              placeholder="Custom"
              className="px-2 py-1 text-xs bg-gray-700 text-white rounded w-24"
            />
            <button onClick={addCustomLabel} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
              Add
            </button>
            <button onClick={cancelLabel} className="px-2 py-1 text-xs text-white hover:bg-gray-700 rounded">
              Cancel
            </button>
          </div>
        )}
      </div>

      {boxes.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Annotations ({boxes.length}):</h3>
          {boxes.map((box) => (
            <div key={box.id} className="flex items-center justify-between mb-2 p-2 bg-white dark:bg-gray-700 rounded">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: box.color }} />
                <span className="font-medium">{box.label}</span>
                <span className="text-xs text-gray-500">
                  {Math.round(box.width)}×{Math.round(box.height)}px
                </span>
              </div>
              <button onClick={() => removeBox(box.id)} className="text-red-600">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}