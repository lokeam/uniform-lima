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

  const idCounterRef = useRef(0);

  // Save boxes to session storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(boxes));
    }
  }, [boxes]);

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
    setBoxes((prev) => [...prev, newBox]);
  };

  const removeBox = (id: string) => {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  const clearAll = () => {
    if (confirm('Clear all annotations?')) {
      setBoxes([]);

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  return {
    boxes,
    addBox,
    removeBox,
    clearAll,
  };
}
