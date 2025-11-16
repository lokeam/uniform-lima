import { useState, useEffect, useRef } from 'react';

// Types
import type { BoundingBox } from '@/app/demos/image-labels/type';

// Constants
import { LABEL_COLORS } from '@/app/demos/image-labels/constants';

const STORAGE_KEY = 'image-labels';

export function useImageLabels() {
  const [boxes, setBoxes] = useState<BoundingBox[]>(() => {
    // Load saved boxes from session storage on mount
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY);

      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // History for undo/redo
  const [history, setHistory] = useState<BoundingBox[][]>(() => [[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const idCounterRef = useRef(0);

  // Save boxes to session storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(boxes));
    }
  }, [boxes]);

  const saveToHistory = (newBoxes: BoundingBox[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newBoxes]);
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
    const newBox: BoundingBox = {
      id: `label-box-${++idCounterRef.current}`,
      ...box,
      label,
      color: LABEL_COLORS[label] || LABEL_COLORS.CUSTOM,
    };
    const newBoxes = [...boxes, newBox];
    setBoxes(newBoxes);
    saveToHistory(newBoxes);
  };

  const removeBox = (id: string) => {
    const newBoxes = boxes.filter((b) => b.id !== id);
    setBoxes(newBoxes);
    saveToHistory(newBoxes);
  };

  const clearAll = () => {
    if (confirm('Clear all annotations?')) {
      setBoxes([]);
      saveToHistory([]);

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const previousBoxes = history[historyIndex - 1];
      setBoxes(previousBoxes);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextBoxes = history[historyIndex + 1];
      setBoxes(nextBoxes);
      setHistoryIndex(historyIndex + 1);
    }
  };

  return {
    boxes,
    addBox,
    removeBox,
    clearAll,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
