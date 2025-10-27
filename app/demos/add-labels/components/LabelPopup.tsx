'use client';

import { useState } from 'react';

// Types
import type { PopupPosition } from '@/app/demos/add-labels/types';

// Constants
import { SUGGESTED_LABELS } from '@/app/demos/add-labels/constants';


interface LabelPopupProps {
  position: PopupPosition;
  onAddLabel: (labelType: string) => void;
  onClose: () => void;
}

export function LabelPopup({ position, onAddLabel, onClose }: LabelPopupProps) {
  const [customInput, setCustomInput] = useState('');

  const handleAddCustomLabel = () => {
    if (!customInput.trim()) return;

    onAddLabel(customInput.toUpperCase());
    setCustomInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomLabel();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent selection from being cleared
    >
      {/* Popup container with caret */}
      <div className="relative bg-gray-800 dark:bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-2 flex items-center gap-2">
        {/* Caret pointing down to the selected text */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-900" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[9px] w-0 h-0 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-gray-900" />

        {/* Quick Label Buttons */}
        {SUGGESTED_LABELS.map((label) => (
          <button
            key={label}
            onClick={() => onAddLabel(label)}
            className="px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 rounded transition-colors"
            title={`Label as ${label}`}
          >
            {label}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-600" />

        {/* Custom Label Input */}
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          placeholder="Custom label"
          className="px-2 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 placeholder:text-gray-400"
        />
        <button
          onClick={handleAddCustomLabel}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={!customInput.trim()}
          className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}