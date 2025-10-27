'use client';

import React, { useRef } from 'react';

// Custom components
import { LabelPopup } from './components/LabelPopup';

// Layout components
import { PageHeadline } from "@/components/layout/page-headline";
import { PageMain } from "@/components/layout/page-main";

// Hooks
import { useLabels } from '@/app/demos/add-labels/hooks/useLabels';
import { useTextSelection } from '@/app/demos/add-labels/hooks/useTextSelection';

// Constants
import {
  SAMPLE_TEXT,
} from '@/app/demos/add-labels/constants';

// Utils
import { exportToJSON, exportToCSV, exportToJSONL } from '@/app/demos/add-labels/utils/exporters';


export default function AddLabelsPage() {
  const textRef = useRef<HTMLDivElement>(null);
  const { labels, addLabel, removeLabel, clearAll } = useLabels();

  const {
    showPopup,
    popupPosition,
    selectedText,
    selectedRange,
    handleMouseUp,
    clearSelection,
  } = useTextSelection(textRef, SAMPLE_TEXT);

  // Export labels as JSON
  const handleExportJSON = () => exportToJSON(labels, SAMPLE_TEXT);

  // Export labels as CSV
  const handleExportCSV = () => exportToCSV(labels);

  // Export labels as JSONL (JSON Lines - common for NLP datasets)
  const handleExportJSONL = () => exportToJSONL(labels, SAMPLE_TEXT);

  const handleAddLabel = (labelType: string) => {
    if (!selectedText || !selectedRange) return;

    addLabel(selectedText, labelType, selectedRange.startWordIndex, selectedRange.endWordIndex);
    clearSelection();
  }

  // Render text with highlights
  const renderTextWithLabels = () => {
    if (labels.length === 0) return SAMPLE_TEXT;

    // Split text into words
    const words = SAMPLE_TEXT.split(/\s+/);

    // Sort labels by start word index
    const sortedLabels = [...labels].sort((a, b) => a.startWordIndex - b.startWordIndex);

    const parts: React.JSX.Element[] = [];
    let lastWordIndex = 0;

    sortedLabels.forEach((label) => {
      // Add unlabeled words before this label
      for (let i = lastWordIndex; i < label.startWordIndex; i++) {
        parts.push(<span key={`word-${i}`}>{words[i]} </span>);
      }

      // Add labeled text
      const labeledText = words.slice(label.startWordIndex, label.endWordIndex + 1).join(' ');
      parts.push(
        <span
          key={label.id}
          data-labeled="true"
          className={`${label.color} border-b-2 px-1 rounded relative group cursor-pointer`}
          onClick={() => removeLabel(label.id)}
        >
          {labeledText}{' '}
          <span data-tooltip="true" className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {label.label} (click to remove)
          </span>
        </span>
      );

      lastWordIndex = label.endWordIndex + 1;
    });

    // Add remaining unlabeled words
    for (let i = lastWordIndex; i < words.length; i++) {
      parts.push(<span key={`word-${i}`}>{words[i]} </span>);
    }

    return parts;
  };

  return (
    <PageMain>
      <PageHeadline
        title="Text Labeling Component Demo"
        description="Click and label any text rendered on the DOM within the component. Export as JSON, CSV, or JSONL."
      />

      {/* Directions + Download Buttons */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select any text with your mouse to add a label. Click on labeled text to remove it.
        </p>
        <div className="flex gap-2">
          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={labels.length === 0}
              className="px-6 py-2 bg-charcoal-900 text-white dark:bg-white dark:text-black rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
            >
              Export
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {labels.length > 0 && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-[background,opacity,visibility] duration-215 z-10">
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-[background] duration-[180ms]"
                >
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-gray-500">Full dataset format</div>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-[background] duration-[180ms]"
                >
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-gray-500">Spreadsheet format</div>
                </button>
                <button
                  onClick={handleExportJSONL}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-[background] duration-[180ms]"
                >
                  <div className="font-medium">JSONL</div>
                  <div className="text-xs text-gray-500">NLP training format</div>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={clearAll}
            disabled={labels.length === 0}
            className="px-6 py-2 rounded-xl bg-white text-black transition duration-200 hover:bg-gray-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Text Area

      block rounded-xl px-6 py-2 text-center text-sm font-medium active:scale-[0.98] sm:text-base border-divide border bg-white text-black transition duration-200 hover:bg-gray-300 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800
      */}
      <div className="relative">
        <div
          ref={textRef}
          onMouseUp={handleMouseUp}
          className="bg-white dark:bg-black border border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-8 leading-relaxed text-gray-900 dark:text-gray-100 select-text cursor-text"
        >
          {renderTextWithLabels()}
        </div>

        {/* Popup Toolbar */}
        {showPopup && (
          <LabelPopup
            position={popupPosition}
            onAddLabel={handleAddLabel}
            onClose={clearSelection}
          />
        )}
      </div>

      {/* Labels Summary */}
      {labels.length > 0 && (
        <div className="bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-8">
          <h3 className="font-semibold mb-3 text-sm">Labels ({labels.length}):</h3>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <div
                key={label.id}
                className={`${label.color} border px-3 py-1 rounded-full text-sm flex items-center gap-2`}
              >
                <span className="font-medium">{label.label}:</span>
                <span>{label.text}</span>
                <button
                  onClick={() => removeLabel(label.id)}
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">How to use:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Click and drag to select any text in the paragraph above</li>
          <li>A popup will appear with suggested labels (PERSON, ORGANIZATION, etc.)</li>
          <li>Click a suggested label or type a custom one and press Enter</li>
          <li>Click on any labeled text to remove the label</li>
          <li>All labels are shown in the summary below the text</li>
        </ul>
      </div>
    </PageMain>
  );
}
