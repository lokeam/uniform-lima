'use client';

import React from 'react';

interface ImageLabelPopupProps {
  suggestedLabels: readonly string[];
  labelInput: string;
  onLabelSelect: (label: string) => void;
  onCustomLabel: () => void;
  onCancel: () => void;
  onInputChange: (value: string) => void;
}

export function ImageLabelPopup({
  suggestedLabels,
  labelInput,
  onLabelSelect,
  onCustomLabel,
  onCancel,
  onInputChange,
}: ImageLabelPopupProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCustomLabel();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="mt-4 bg-gray-800 rounded-lg p-3 inline-flex items-center gap-2">
      <span className="text-white text-sm">Label the auto damage:</span>
      {suggestedLabels.map((label) => (
        <button
          key={label}
          onClick={() => onLabelSelect(label)}
          className="px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 rounded transition-colors duration-150"
        >
          {label}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-600" />
      <input
        type="text"
        value={labelInput}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Custom"
        className="px-2 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 placeholder:text-gray-400"
        autoFocus
      />
      <button
        onClick={onCustomLabel}
        disabled={!labelInput.trim()}
        className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
      >
        Add
      </button>
      <button
        onClick={onCancel}
        className="px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 rounded transition-colors duration-150"
      >
        Cancel
      </button>
    </div>
  );
}
