/* eslint-disable @next/next/no-img-element */
'use client';

// Layout components
import { PageHeadline } from "@/components/layout/page-headline";
import { PageMain } from "@/components/layout/page-main";

// Components
import { ImageLabelPopup } from '@/app/demos/image-labels/components/ImageLabelPopup';

// Hooks
import { useImageLabels } from '@/app/demos/image-labels/hooks/useImageLabels';
import { useCanvasDrawing } from '@/app/demos/image-labels/hooks/useCanvasDrawing';
import { useLabelPopup } from '@/app/demos/image-labels/hooks/useLabelPopup';

// Utils
import { exportLabeledImage } from '@/app/demos/image-labels/utils/canvasDrawing';

// Constants
import { SAMPLE_IMAGE, SUGGESTED_LABELS } from '@/app/demos/image-labels/constants';


export default function ImageLabelingPage() {
  // Custom hooks
  const { boxes, addBox, removeBox, clearAll } = useImageLabels();

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
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={boxes.length === 0}
            className="px-6 py-2 bg-charcoal-900 text-white dark:bg-white dark:text-black rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Download Image
          </button>
          <button
            onClick={clearAll}
            disabled={boxes.length === 0}
            className="px-6 py-2 rounded-xl bg-white text-black transition duration-200 hover:bg-gray-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Image Canvas */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="relative inline-block">
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
