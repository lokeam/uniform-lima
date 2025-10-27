import type { BoundingBox } from '@/app/demos/image-labels/type';

// Canvas drawing constants
const LABEL_FONT = '14px sans-serif';
const LABEL_PADDING = 10;
const LABEL_HEIGHT = 25;
const LABEL_OFFSET_Y = 7;
const LABEL_OFFSET_X = 5;
const BOX_LINE_WIDTH = 3;
const PREVIEW_LINE_WIDTH = 2;
const PREVIEW_COLOR = '#3b82f6';
const PREVIEW_DASH = [5, 5];

/**
 * Draw a bounding box with label on canvas
 */
export function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  box: BoundingBox
): void {
  // Draw box
  ctx.strokeStyle = box.color;
  ctx.lineWidth = BOX_LINE_WIDTH;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  // Draw label background
  ctx.fillStyle = box.color;
  ctx.font = LABEL_FONT;
  const textWidth = ctx.measureText(box.label).width;
  ctx.fillRect(box.x, box.y - LABEL_HEIGHT, textWidth + LABEL_PADDING, LABEL_HEIGHT);

  // Draw label text
  ctx.fillStyle = 'white';
  ctx.fillText(box.label, box.x + LABEL_OFFSET_X, box.y - LABEL_OFFSET_Y);
}

/**
 * Draw a dashed preview box (while drawing)
 */
export function drawDashedBox(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number }
): void {
  ctx.strokeStyle = PREVIEW_COLOR;
  ctx.lineWidth = PREVIEW_LINE_WIDTH;
  ctx.setLineDash(PREVIEW_DASH);
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.setLineDash([]);
}

/**
 * Get scaled coordinates from mouse event
 */
export function getScaledCoordinates(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

/**
 * Normalize a box (handle negative width/height from right-to-left or bottom-to-top drawing)
 */
export function normalizeBox(box: {
  x: number;
  y: number;
  width: number;
  height: number;
}): { x: number; y: number; width: number; height: number } {
  return {
    x: box.width < 0 ? box.x + box.width : box.x,
    y: box.height < 0 ? box.y + box.height : box.y,
    width: Math.abs(box.width),
    height: Math.abs(box.height),
  };
}

/**
 * Export labeled image as PNG
 */
export function exportLabeledImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  boxes: BoundingBox[]
): void {
  // Create a temporary canvas to combine image + labels
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = image.naturalWidth;
  exportCanvas.height = image.naturalHeight;
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return;

  // Draw the original image
  ctx.drawImage(image, 0, 0);

  // Draw all the boxes and labels on top
  boxes.forEach((box) => drawBoundingBox(ctx, box));

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
}
