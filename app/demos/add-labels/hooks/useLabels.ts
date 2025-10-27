import { useState, useEffect, useRef } from 'react';

// Utils
import {
  loadLabelsFromStorage,
  saveLabelsToStorage,
  clearLabelsFromStorage
} from '@/app/demos/add-labels/utils/storage';

// Types
import type { Label } from '@/app/demos/add-labels/types';

// Constants
import { LABEL_COLORS } from '@/app/demos/add-labels/constants';

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>(loadLabelsFromStorage);
  const idCounterRef = useRef(0);

  // Save labels to session storage whenever they change
  useEffect(() => {
    saveLabelsToStorage(labels);
  }, [labels]);

  const addLabel = (
    text: string,
    labelType: string,
    startWordIndex: number,
    endWordIndex: number
  ): void => {
    const newLabel: Label = {
      id: `label-${++idCounterRef.current}`,
      text,
      label: labelType,
      startWordIndex,
      endWordIndex,
      color: LABEL_COLORS[labelType] || LABEL_COLORS.CUSTOM,
    };

    setLabels(prev => [...prev, newLabel]);
  };

  const removeLabel = (id: string): void => {
    setLabels(prev => prev.filter(l => l.id !== id));
  };

  const clearAll = (): void => {
    if (confirm('Clear all labels?')) {
      setLabels([]);
      clearLabelsFromStorage();
    }
  };

  return {
    labels,
    addLabel,
    removeLabel,
    clearAll,
  };
}
