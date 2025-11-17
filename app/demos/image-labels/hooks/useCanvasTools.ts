import { useState, useCallback } from 'react';

export type CanvasTool = 'cursor' | 'square' | 'polygon' | 'undo' | 'redo' | 'download' | 'clear';

/*
  Hook for managing the canvas tools.
  Handles setting the current tool and providing utility functions for checking the currently selected tool.
*/
export function useCanvasTools() {
  const [currentTool, setCurrentTool] = useState<CanvasTool>('square');

  const setTool = useCallback((tool: CanvasTool) => {
    setCurrentTool(tool);
  }, []);

  return {
    currentTool,
    setTool,
    isSquareTool: currentTool === 'square',
    isPolygonTool: currentTool === 'polygon',
    isCursorTool: currentTool === 'cursor',
  };
}