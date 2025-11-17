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
import { useShapeManager } from '@/app/demos/image-labels/hooks/useShapeManager';
import { useCanvasDrawing } from '@/app/demos/image-labels/hooks/useCanvasDrawing';
import { useLabelPopup } from '@/app/demos/image-labels/hooks/useLabelPopup';
import { useCanvasTools } from '@/app/demos/image-labels/hooks/useCanvasTools';

// Types
import type { BoundingBox } from '@/app/demos/image-labels/type';

// Utils
import { exportLabeledImage, drawBoundingBox, drawPolygon } from '@/app/demos/image-labels/utils/canvasDrawing';

// Constants
import { SAMPLE_IMAGE, SUGGESTED_LABELS, TOOLBAR_HOVER_DESCRIPTIONS } from '@/app/demos/image-labels/constants';
import { Polygon, useDrawCanvasPolygon } from './hooks/useDrawCanvasPolygon';


export default function ImageLabelingPage() {
  const [hoverDescription, setHoverDescription] = useState(TOOLBAR_HOVER_DESCRIPTIONS.DEFAULT);


  // Original working hooks
  const { drawnShapes, addBox, addPolygon, removeShape, clearAll, undo, redo, canUndo, canRedo, updateBox } = useShapeManager();
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
    drawnShapes,
    onBoxComplete: openPopup,
    onBoxUpdate: updateBox,
  });

  const {
    currentPoints,
    isDrawing: isDrawingPoygon,
    handleCanvasClick,
    drawCurrentPolygon,
    getStatusMessage,
    canCompletePolygon,
    pendingPolygon,
    completeWithLabel,
  } = useDrawCanvasPolygon({
    canvasRef,
    onPolygonComplete: (polygon) => {
      console.log('Polygon completed with label:', polygon);
      // Polygon already has label, just save it
      addPolygon(polygon);
    },
    onLabelRequest: () => {
      console.log('Polygon requesting label, showing popup');
      openPopup({ x: 0, y: 0, width: 0, height: 0 });
    },
    distanceInPxToCloseShape: 15,
    isActive: currentTool === 'polygon',
  });

  // Serve different cursors based on tool
  const getCursorKeyword = () => {
    if (currentTool === 'cursor') return 'move';
    if (currentTool === 'square' || currentTool === 'polygon') return 'crosshair';
    return 'default';
  }

  // Handle label selection
  const onLabelSelect = (label: string) => {
    console.log('Label selected:', label, 'pendingPolygon:', !!pendingPolygon);
    if (pendingPolygon) {
      console.log('Completing polygon with label:', label);
      // Complete polygon with selected label
      completeWithLabel(label);
      closePopup();
    } else {
      console.log('Adding box with label:', label);
      // Handle box labeling (existing logic)
      handleLabelSelect(label, (box, selectedLabel) => {
        addBox(box, selectedLabel);
        clearCurrentBox();
      });
    }
  };

  // Handle custom label
  const onCustomLabel = () => {
    if (!labelInput.trim()) return;
    onLabelSelect(labelInput.toUpperCase());
  };

  // Unified handler for mouse events, handles either bounding boxes or polygons
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Canvas clicked! Current tool:', currentTool);

    // Listen if polygon tool is active
    if (currentTool === 'polygon') {
      console.log('Polygon tool active - calling handleCanvasClick');
      handleCanvasClick(e);
      return;
    }

    console.log('Box tool active - calling handleMouseDown');
    // Otherwise handle bounding box
    handleMouseDown(e);
  }

  // Handle cancel
  const onCancel = () => {
    closePopup();
    clearCurrentBox();
  };

  // Export image
  const handleExport = () => {
    if (!canvasRef.current || !imageRef.current) return;
    exportLabeledImage(canvasRef.current, imageRef.current, drawnShapes);
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
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => isDrawing && handleMouseUp()}
            className="absolute top-0 left-0 w-full h-full"
            style={{ cursor: getCursorKeyword() }}
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

      {drawnShapes.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Annotations ({drawnShapes.length}):</h3>
          {drawnShapes.map((shape) => (
            <div key={shape.id} className="flex items-center justify-between mb-2 p-2 bg-white dark:bg-gray-700 rounded">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: shape.color }} />
                <span className="font-medium">{shape.label}</span>
                <span className="text-xs text-gray-500">
                  {shape.type === 'box'
                    ? `${Math.round((shape as BoundingBox).width)}×${Math.round((shape as BoundingBox).height)}px`
                    : `${(shape as Polygon).points.length} points`}
                </span>
              </div>
              <button onClick={() => removeShape(shape.id)} className="text-red-600">Remove</button>
            </div>
          ))}
        </div>
      )}
    </PageMain>
  );
}
