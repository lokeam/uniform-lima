'use client';

// Custom Hooks
import { useCanvasTools } from '@/app/demos/image-labels/hooks/useCanvasTools'

// types
import { CanvasTool } from '@/app/demos/image-labels/hooks/useCanvasTools'

// Icons
import UndoRedoIcon from '../Icons/UndoIcon';
import CursorIcon from '@/components/ui/Icons/CursorIcon';
import SquareIcon from '@/components/ui/Icons/SquareIcon';
import PolygonIcon from '@/components/ui/Icons/PolygonIcon';
import DownloadIcon from '@/components/ui/Icons/DownloadIcon';
import DeleteIcon from '@/components/ui/Icons/DeleteIcon';
import { TOOLBAR_HOVER_DESCRIPTIONS } from '@/app/demos/image-labels/constants';


interface CanvasToolbarProps {
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onDownload?: () => void;
  onClear?: () => void;
  onHoverChange?: (description: string) => void;
  setTool?: (tool: CanvasTool) => void;
  setDragMode?: (dragMode: boolean) => void;
  currentTool?: CanvasTool;
}

export function CanvasToolbar({
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  onDownload,
  onClear,
  onHoverChange,
  setTool,
  setDragMode,
  currentTool,
}: CanvasToolbarProps = {}) {
  // Data from Custom Hooks
  const fallbackHook = useCanvasTools();
  const actualSetTool = setTool || fallbackHook.setTool;
  const actualCurrentTool = currentTool || fallbackHook.currentTool;

  const isSquareTool = actualCurrentTool === 'square';
  const isPolygonTool = actualCurrentTool === 'polygon';
  const isCursorTool = actualCurrentTool === 'cursor';

  // Helper fn to render tool btns
  const renderToolbarButton = (
    icon: React.ReactNode,
    tooltip: string,
    hoverText: string,
    onClick?: () => void,
    disabled?: boolean,
    isActive?: boolean
  ) => (
    <button
      className={`p-3 cursor-pointer rounded-lg duration-200 hover:bg-fd-accent tooltip ${
        isActive ? 'bg-fd-accent' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-tooltip={tooltip}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => onHoverChange?.(hoverText)}
      onMouseLeave={() => onHoverChange?.(TOOLBAR_HOVER_DESCRIPTIONS.DEFAULT)}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-row justify-between bg-fd-card rounded-lg p-1 mb-6" id="toolbar-wrapper">
      {/* Drawing Tools */}
      <div className="flex flex-row gap-2">
        {/* Undo Button */}
        {renderToolbarButton(<UndoRedoIcon className="w-6 h-6" />, 'Undo', TOOLBAR_HOVER_DESCRIPTIONS.UNDO, undo, !canUndo)}

        {/* Redo Button */}
        {renderToolbarButton(<UndoRedoIcon className="w-6 h-6" flipped />, 'Redo', TOOLBAR_HOVER_DESCRIPTIONS.REDO, redo, !canRedo)}

        {/* Cursor Button */}
        {renderToolbarButton(<CursorIcon className="w-6 h-6" />, 'Cursor', TOOLBAR_HOVER_DESCRIPTIONS.CURSOR, () => {
          actualSetTool('cursor');
          setDragMode?.(true);
        }, false, isCursorTool)}

        {/* Square Button */}
        {renderToolbarButton(<SquareIcon className="w-6 h-6" />, 'Square', TOOLBAR_HOVER_DESCRIPTIONS.SQUARE, () => {
          actualSetTool('square');
          setDragMode?.(false);
        }, false, isSquareTool)}

        {/* Polygon Button */}
        {renderToolbarButton(<PolygonIcon className="w-6 h-6" />, 'Polygon', TOOLBAR_HOVER_DESCRIPTIONS.POLYGON, () => {
          actualSetTool('polygon');
          setDragMode?.(false);
        }, false, isPolygonTool)}
      </div>

      {/* Download and Export buttons*/}
      <div className="flex flex-row gap-2">
        {/* Download Button */}
        {renderToolbarButton(<DownloadIcon className="w-6 h-6" />, 'Download', TOOLBAR_HOVER_DESCRIPTIONS.DOWNLOAD, onDownload)}

        {/* Delete Button */}
        {renderToolbarButton(<DeleteIcon className="w-6 h-6" />, 'Clear', TOOLBAR_HOVER_DESCRIPTIONS.CLEAR, onClear)}
      </div>
    </div>
  )
}