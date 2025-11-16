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


interface CanvasToolbarProps {
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onDownload?: () => void;
  onClear?: () => void;
}

export function CanvasToolbar({ undo, redo, canUndo = false, canRedo = false, onDownload, onClear }: CanvasToolbarProps = {}) {
  // Data from Custom Hooks
  const { currentTool, setTool, isSquareTool, isPolygonTool, isCursorTool } = useCanvasTools();

  // Helper fn to render tool btns
  const renderToolButton = (
    tool: CanvasTool,
    icon: React.ReactNode,
    tooltip: string,
    isActive: boolean = false,
  ) => (
    <button
      className={`p-3 cursor-pointer rounded-lg duration-200 hover:bg-fd-accent tooltip ${
        isActive ? 'bg-fd-accent' : ''
      }`}
      data-tooltip={tooltip}
      onClick={() => setTool(tool)}
    >
      {icon}
    </button>
  )

  return (
    <div className="flex flex-row justify-between bg-fd-card rounded-lg p-1 mb-6" id="toolbar-wrapper">
      {/* Drawing Tools */}
      <div className="flex flex-row gap-2">
        {/* Undo Button */}
        <button
          className={`p-3 cursor-pointer rounded-lg duration-200 hover:bg-fd-accent tooltip ${
            canUndo ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          data-tooltip="Undo"
          onClick={undo}
          disabled={!canUndo}
        >
          <UndoRedoIcon className="w-6 h-6" />
        </button>

        {/* Redo Button */}
        <button
          className={`p-3 cursor-pointer rounded-lg duration-200 hover:bg-fd-accent tooltip ${
            canRedo ? '' : 'opacity-50 cursor-not-allowed'
          }`}
          data-tooltip="Redo"
          onClick={redo}
          disabled={!canRedo}
        >
          <UndoRedoIcon className="w-6 h-6" flipped />
        </button>

        {/* Cursor Button */}
        {renderToolButton('cursor', <CursorIcon className="w-6 h-6" />, 'Cursor', isCursorTool)}

        {/* Square Button */}
        {renderToolButton('square', <SquareIcon className="w-6 h-6" />, 'Sqaure', isSquareTool)}

        {/* Polygon Button */}
        {renderToolButton('polygon', <PolygonIcon className="w-6 h-6" />, 'Polygon', isPolygonTool)}
      </div>

      {/* Downlaod and Export buttons*/}
      <div className="flex flex-row gap-2">
        {/* Download Button */}
        <button
          className="p-3 cursor-pointer rounded-lg duration-200 hover:bg-fd-accent tooltip"
          data-tooltip="Download"
          onClick={onDownload}
        >
          <DownloadIcon className="w-6 h-6" />
        </button>

        {/* Delete Button */}
        <button
          className="p-3 cursor-pointer rounded-lg duration-200 hover:bg-fd-accent tooltip"
          data-tooltip="Clear"
          onClick={onClear}
        >
          <DeleteIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}