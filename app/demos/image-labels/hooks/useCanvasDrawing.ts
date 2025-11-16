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
  onBoxUpdate: (id: string, updates: { x: number; y: number }) => void;
}

export function useCanvasDrawing({ boxes, onBoxComplete, onBoxUpdate }: UseCanvasDrawingProps) {

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Drag and drop state
  const [isDragAndDropActive, setIsDragAndDropActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBox, setDraggedBox] = useState<BoundingBox | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Draw all boxes on canvas
  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing boxes
    boxes.forEach((box) => {
      if (!draggedBox || box.id !== draggedBox.id) {
        drawBoundingBox(ctx, box);
      }
    });

    // Draw dragged box at new position
    if (draggedBox) {
      drawBoundingBox(ctx, draggedBox);
    }

    // Draw current box being drawn
    if (currentBox) {
      drawDashedBox(ctx, currentBox);
    }
  }, [boxes, currentBox, draggedBox]);

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

  const getBoxAtPosition = (x: number, y: number): BoundingBox | null => {
    // Check boxes in reverse order (most recent boxes first)
    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];

      if (x >= box.x &&
          x <= box.x + box.width &&
          y >= box.y &&
          y <= box.y + box.height) {
        return box; // Found a hit!
      }
    }
    return null; // No box was clicked
  };

  const handleDragModeClick = (x: number, y: number) => {
    const clickedBox = getBoxAtPosition(x, y);
    if (clickedBox) {

      // Remember which box we are dragging
      console.log('Starting drag for box:', clickedBox.id);
      setDraggedBox(clickedBox);

      // Keep track of left and top edges
      setDragOffset({ x: x - clickedBox.x, y: y - clickedBox.y });
      setIsDragging(true);
    }
  };

  const handleDrawModeClick = (x: number, y: number) => {
    setIsDrawing(true);
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getScaledCoordinates(e, canvas);

    if (isDragAndDropActive) {
      handleDragModeClick(x, y);
    } else {
      handleDrawModeClick(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Guard clause for canvas, get coordinates
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x: currentX, y: currentY } = getScaledCoordinates(e, canvas);

    // Handle dragging
    if (isDragging && draggedBox && dragOffset) {
      const newX = currentX - dragOffset.x;
      const newY = currentY - dragOffset.y;

      setDraggedBox({ ...draggedBox, x: newX, y: newY });
      drawBoxes();

      return;
    }

    // Handle drawing
    if (!isDrawing || !currentBox) return;
    const width = currentX - currentBox.x;
    const height = currentY - currentBox.y;

    setCurrentBox({ ...currentBox, width, height });
    drawBoxes();
  };

  const handleMouseUp = () => {
    // Handle end of dragging
    if (isDragging && draggedBox) {
      console.log('Drag ended, final position:', draggedBox.x, draggedBox.y);
      // Save the final position
      onBoxUpdate(draggedBox.id, {
        x: draggedBox.x,
        y: draggedBox.y
      });

      setIsDragging(false);
      setDraggedBox(null);
      setDragOffset(null);
      return;
    }

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
    isDragAndDropActive,
    setIsDragAndDropActive,
  };
}
