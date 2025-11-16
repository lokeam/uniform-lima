/* eslint-disable @next/next/no-img-element */
'use client';

// Layout components
import { PageHeadline } from "@/components/layout/page-headline";
import { PageMain } from "@/components/layout/page-main";

// Components
import { ImageLabelPopup } from '@/app/demos/image-labels/components/ImageLabelPopup';
import { CanvasToolbar } from '@/components/ui/CanvasToolbar/CanvasToolbar';

// Hooks
import { useImageLabels } from '@/app/demos/image-labels/hooks/useImageLabels';
import { useCanvasDrawing } from '@/app/demos/image-labels/hooks/useCanvasDrawing';
import { useLabelPopup } from '@/app/demos/image-labels/hooks/useLabelPopup';
import { useCanvasTools } from '@/app/demos/image-labels/hooks/useCanvasTools';

// Types
import type { BoundingBox } from '@/app/demos/image-labels/type';

// Utils
import { exportLabeledImage } from '@/app/demos/image-labels/utils/canvasDrawing';

// Constants
import { SAMPLE_IMAGE, SUGGESTED_LABELS } from '@/app/demos/image-labels/constants';


export default function ImageLabelingPage() {
  // Original working hooks
  const { currentTool, isPolygonTool, isSquareTool, isCursorTool } = useCanvasTools();
  const { boxes, addBox, removeBox, clearAll, undo, redo, canUndo, canRedo } = useImageLabels();

  const {
    showPopup,
    labelInput,
    setLabelInput,
    openPopup,
    closePopup,
    handleLabelSelect,
  } = useLabelPopup();

  const {
    canvasRef,
    imageRef,
    isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleImageLoad,
    clearCurrentBox,
  } = useCanvasDrawing({
    boxes,
    onBoxComplete: openPopup,
  });

  // Handle label selection
  const onLabelSelect = (label: string) => {
    handleLabelSelect(label, (box, selectedLabel) => {
      addBox(box, selectedLabel);
      clearCurrentBox();
    });
  };

  // Handle custom label
  const onCustomLabel = () => {
    if (!labelInput.trim()) return;
    onLabelSelect(labelInput.toUpperCase());
  };

  // Handle cancel
  const onCancel = () => {
    closePopup();
    clearCurrentBox();
  };

  // Export image
  const handleExport = () => {
    if (!canvasRef.current || !imageRef.current) return;
    exportLabeledImage(canvasRef.current, imageRef.current, boxes);
  };

  return (
    <PageMain>
      <PageHeadline
        title="Image Labeling Component Demo"
        description="Create custom canvas bounding box labels on any image and download this annotated file."
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click and drag on the image to draw bounding boxes.
        </p>
      </div>

      {/* Canvas Toolbar */}
      <CanvasToolbar
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onDownload={handleExport}
        onClear={clearAll}
      />

      {/* Image Canvas */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="relative inline-block">
          {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
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

        {showPopup && (
          <ImageLabelPopup
            suggestedLabels={SUGGESTED_LABELS}
            labelInput={labelInput}
            onLabelSelect={onLabelSelect}
            onCustomLabel={onCustomLabel}
            onCancel={onCancel}
            onInputChange={setLabelInput}
          />
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
    </PageMain>
  );
}
