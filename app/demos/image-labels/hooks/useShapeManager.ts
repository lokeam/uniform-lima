import { useState, useEffect, useRef } from 'react';

// Types
import type { BoundingBox } from '@/app/demos/image-labels/type';
import type { Shape } from '@/app/demos/image-labels/hooks/useDrawCanvasPolygon';
import type { Polygon } from '@/app/demos/image-labels/hooks/useDrawCanvasPolygon';

// Constants
import { LABEL_COLORS } from '@/app/demos/image-labels/constants';

const STORAGE_KEY = 'image-labels';

export function useShapeManager() {
  const [drawnShapes, setDrawnShapes] = useState<Shape[]>(() => {
    // Load saved boxes from session storage on mount
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY);

      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // History for undo/redo
  const [history, setHistory] = useState<Shape[][]>(() => [[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const idCounterRef = useRef(0);

  // Save shapes to session storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(drawnShapes));
    }
  }, [drawnShapes]);

  const saveToHistory = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addBox = (
    box: {
      x: number;
      y: number;
      width: number;
      height: number
    },
    label: string
  ) => {
    const newBox: BoundingBox & { type: 'box' } = {
      id: `label-box-${++idCounterRef.current}`,
      ...box,
      label,
      color: LABEL_COLORS[label] || LABEL_COLORS.CUSTOM,
      type: 'box',
    };
    const newShapes = [...drawnShapes, newBox];
    setDrawnShapes(newShapes);
    saveToHistory(newShapes);
  };

  const addPolygon = (polygon: Omit<Polygon, 'type'>) =>{
    const newPolygon = { ...polygon, type: 'polygon' as const };
    const newShapes = [...drawnShapes, newPolygon];
    setDrawnShapes(newShapes);
    saveToHistory(newShapes);
  }

  const removeShape = (id: string) => {
    const newShapes = drawnShapes.filter((b) => b.id !== id);
    setDrawnShapes(newShapes);
    saveToHistory(newShapes);
  };

  const clearAll = () => {
    if (confirm('Clear all annotations?')) {
      setDrawnShapes([]);
      saveToHistory([]);

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const previousShapes = history[historyIndex - 1];
      setDrawnShapes(previousShapes);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextShapes = history[historyIndex + 1];
      setDrawnShapes(nextShapes);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const updateBox = (id: string, updates: { x: number; y: number }) => {
    const newBoxes = drawnShapes.map(shape =>
      shape.id === id ? { ...shape, ...updates } : shape
    );
    setDrawnShapes(newBoxes);
    saveToHistory(newBoxes);
  };

  return {
    drawnShapes,
    addBox,
    addPolygon,
    removeShape,
    clearAll,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    updateBox,
  };
}
