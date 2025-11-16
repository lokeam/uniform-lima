/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

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
import { SAMPLE_IMAGE, SUGGESTED_LABELS, TOOLBAR_HOVER_DESCRIPTIONS } from '@/app/demos/image-labels/constants';


export default function ImageLabelingPage() {
  const [hoverDescription, setHoverDescription] = useState(TOOLBAR_HOVER_DESCRIPTIONS.DEFAULT);

  // Original working hooks
  const { boxes, addBox, removeBox, clearAll, undo, redo, canUndo, canRedo, updateBox } = useImageLabels();
  const { currentTool, setTool } = useCanvasTools();

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
    isDragAndDropActive,
    setIsDragAndDropActive,
  } = useCanvasDrawing({
    boxes,
    onBoxComplete: openPopup,
    onBoxUpdate: updateBox,
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

      {/* Toolbar Button Hover Descriptions */}
      <div className="flex flex-col items-center justify-between mb-2">
        <p id="toolbar-btn-hover-descriptions" className="text-sm font-bold text-green-600">
          {hoverDescription}
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
        setTool={setTool}
        setDragMode={setIsDragAndDropActive}
        currentTool={currentTool}
        onHoverChange={setHoverDescription}
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
            className="absolute top-0 left-0 w-full h-full"
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
