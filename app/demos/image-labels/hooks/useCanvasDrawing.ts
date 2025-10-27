import { useState, useRef, useEffect, useCallback } from 'react';
import type { BoundingBox } from '@/app/demos/image-labels/type';
import {
  drawBoundingBox,
  drawDashedBox,
  getScaledCoordinates,
  normalizeBox,
} from '@/app/demos/image-labels/utils/canvasDrawing';
import { MIN_BOX_SIZE } from '@/app/demos/image-labels/constants';

interface UseCanvasDrawingProps {
  boxes: BoundingBox[];
  onBoxComplete: (box: { x: number; y: number; width: number; height: number }) => void;
}

export function useCanvasDrawing({ boxes, onBoxComplete }: UseCanvasDrawingProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Draw all boxes on canvas
  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing boxes
    boxes.forEach((box) => drawBoundingBox(ctx, box));

    // Draw current box being drawn
    if (currentBox) {
      drawDashedBox(ctx, currentBox);
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

    const { x, y } = getScaledCoordinates(e, canvas);
    setIsDrawing(true);
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentBox) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const { x: currentX, y: currentY } = getScaledCoordinates(e, canvas);
    const width = currentX - currentBox.x;
    const height = currentY - currentBox.y;

    setCurrentBox({ ...currentBox, width, height });
    drawBoxes();
  };

  const handleMouseUp = () => {
    if (
      !currentBox ||
      Math.abs(currentBox.width) < MIN_BOX_SIZE ||
      Math.abs(currentBox.height) < MIN_BOX_SIZE
    ) {
      setIsDrawing(false);
      setCurrentBox(null);
      return;
    }

    const normalized = normalizeBox(currentBox);

    setIsDrawing(false);
    setCurrentBox(normalized);
    onBoxComplete(normalized);
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

  const clearCurrentBox = () => {
    setCurrentBox(null);
  };

  return {
    canvasRef,
    imageRef,
    isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleImageLoad,
    clearCurrentBox,
  };
}
