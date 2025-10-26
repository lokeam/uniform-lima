'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Label {
  id: string;
  text: string;
  label: string;
  startIndex: number;
  endIndex: number;
  color: string;
}

const LABEL_COLORS: Record<string, string> = {
  PERSON: 'bg-blue-200 dark:bg-blue-900/40 border-blue-400',
  ORGANIZATION: 'bg-green-200 dark:bg-green-900/40 border-green-400',
  LOCATION: 'bg-purple-200 dark:bg-purple-900/40 border-purple-400',
  DATE: 'bg-orange-200 dark:bg-orange-900/40 border-orange-400',
  CUSTOM: 'bg-pink-200 dark:bg-pink-900/40 border-pink-400',
};

const SAMPLE_TEXT = `The Beatles were an English rock band formed in Liverpool in 1960. The core lineup of the band comprised John Lennon, Paul McCartney, George Harrison and Ringo Starr. They are widely regarded as the most influential band in Western popular music and were integral to the development of 1960s counterculture and the recognition of popular music as an art form. Rooted in skiffle, beat and 1950s rock 'n' roll, their sound incorporated elements of classical music and traditional pop in innovative ways. The band also explored music styles ranging from folk and Indian music to psychedelia and hard rock. As pioneers in recording, songwriting and artistic presentation, the Beatles revolutionised many aspects of the music industry and were often publicised as leaders of the era's youth and sociocultural movements.`;

export default function AddLabelsPage() {
  const [labels, setLabels] = useState<Label[]>(() => {
    // Load saved labels from session storage on mount
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('text-labels');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [suggestedLabels] = useState(['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE']);
  const textRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const idCounterRef = useRef(0);

  // Handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowPopup(false);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText || !textRef.current) {
      setShowPopup(false);
      return;
    }

    // Get selection position relative to the text container
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = textRef.current.getBoundingClientRect();

    // Save the range so we can restore it later
    savedRangeRef.current = range.cloneRange();

    // Calculate position for popup (centered above selection)
    // Position it higher to avoid obscuring the selection
    const x = rect.left + rect.width / 2 - containerRect.left;
    const y = rect.top - containerRect.top - 60; // 60px above selection for popup + caret

    // Create a range from the start of the container to the start of the selection
    const preRange = document.createRange();
    preRange.selectNodeContents(textRef.current);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startIndex = preRange.toString().length;
    const endIndex = startIndex + selectedText.length;

    setSelectedText(selectedText);
    setSelectedRange({ start: startIndex, end: endIndex });
    setPopupPosition({ x, y });
    setShowPopup(true);
    setLabelInput('');

    // Keep the selection visible by restoring it after a brief delay
    // This ensures it stays highlighted even after the popup appears
    setTimeout(() => {
      if (savedRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      }
    }, 0);
  };

  // Add label
  const addLabel = (labelType: string) => {
    if (!selectedText || !selectedRange) return;

    const newLabel: Label = {
      id: `label-${++idCounterRef.current}`,
      text: selectedText,
      label: labelType,
      startIndex: selectedRange.start,
      endIndex: selectedRange.end,
      color: LABEL_COLORS[labelType] || LABEL_COLORS.CUSTOM,
    };

    setLabels([...labels, newLabel]);
    setShowPopup(false);
    setLabelInput('');
    setSelectedText('');
    setSelectedRange(null);
    savedRangeRef.current = null;

    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  // Add custom label
  const addCustomLabel = () => {
    if (!labelInput.trim()) return;
    addLabel(labelInput.toUpperCase());
  };

  // Remove label
  const removeLabel = (id: string) => {
    setLabels(labels.filter(l => l.id !== id));
  };

  // Save labels to session storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('text-labels', JSON.stringify(labels));
    }
  }, [labels]);

  // Clear all labels
  const clearAll = () => {
    if (confirm('Clear all labels?')) {
      setLabels([]);
      sessionStorage.removeItem('text-labels');
    }
  };

  // Export labels as JSON
  const exportJSON = () => {
    const data = {
      text: SAMPLE_TEXT,
      labels: labels.map(l => ({
        text: l.text,
        label: l.label,
        start: l.startIndex,
        end: l.endIndex,
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        totalLabels: labels.length,
      },
    };
    downloadFile(JSON.stringify(data, null, 2), 'text-labels.json', 'application/json');
  };

  // Export labels as CSV
  const exportCSV = () => {
    const headers = ['text', 'label', 'start_index', 'end_index'];
    const rows = labels.map(l => [
      `"${l.text.replace(/"/g, '""')}"`, // Escape quotes
      l.label,
      l.startIndex,
      l.endIndex,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, 'text-labels.csv', 'text/csv');
  };

  // Export labels as JSONL (JSON Lines - common for NLP datasets)
  const exportJSONL = () => {
    const jsonl = labels
      .map(l => JSON.stringify({
        text: l.text,
        label: l.label,
        start: l.startIndex,
        end: l.endIndex,
        context: SAMPLE_TEXT.slice(Math.max(0, l.startIndex - 50), Math.min(SAMPLE_TEXT.length, l.endIndex + 50)),
      }))
      .join('\n');
    downloadFile(jsonl, 'text-labels.jsonl', 'application/x-ndjson');
  };

  // Helper function to download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render text with highlights
  const renderTextWithLabels = () => {
    if (labels.length === 0) return SAMPLE_TEXT;

    // Sort labels by start index
    const sortedLabels = [...labels].sort((a, b) => a.startIndex - b.startIndex);

    const parts: React.JSX.Element[] = [];
    let lastIndex = 0;

    sortedLabels.forEach((label, idx) => {
      // Add text before label
      if (label.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {SAMPLE_TEXT.slice(lastIndex, label.startIndex)}
          </span>
        );
      }

      // Add labeled text
      parts.push(
        <span
          key={label.id}
          className={`${label.color} border-b-2 px-1 rounded relative group cursor-pointer`}
          onClick={() => removeLabel(label.id)}
        >
          {label.text}
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {label.label} (click to remove)
          </span>
        </span>
      );

      lastIndex = label.endIndex;
    });

    // Add remaining text
    if (lastIndex < SAMPLE_TEXT.length) {
      parts.push(
        <span key="text-end">
          {SAMPLE_TEXT.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Text Labeling Demo</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select any text with your mouse to add a label. Click on labeled text to remove it.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Export Dropdown */}
          <div className="relative group">
            <button
              disabled={labels.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
            >
              Export
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {labels.length > 0 && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={exportJSON}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-gray-500">Full dataset format</div>
                </button>
                <button
                  onClick={exportCSV}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-gray-500">Spreadsheet format</div>
                </button>
                <button
                  onClick={exportJSONL}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
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
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <div
          ref={textRef}
          onMouseUp={handleMouseUp}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6 leading-relaxed text-gray-900 dark:text-gray-100 select-text cursor-text"
          style={{ userSelect: 'text' }}
        >
          {renderTextWithLabels()}
        </div>

        {/* Popup Toolbar */}
        {showPopup && (
          <div
            className="absolute z-10"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              transform: 'translateX(-50%)',
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent selection from being cleared
          >
            {/* Popup container with caret */}
            <div className="relative bg-gray-800 dark:bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-2 flex items-center gap-2">
              {/* Caret pointing down to the selected text */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-gray-900 " />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-[9px] w-0 h-0 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-gray-900" />
            {/* Quick Label Buttons */}
            {suggestedLabels.map((label) => (
              <button
                key={label}
                onClick={() => addLabel(label)}
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
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomLabel();
                if (e.key === 'Escape') setShowPopup(false);
              }}
              onMouseDown={(e) => e.stopPropagation()} // Allow clicking in input
              onClick={(e) => e.stopPropagation()} // Allow clicking in input
              placeholder="Custom label"
              className="px-2 py-1 text-xs bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24 placeholder:text-gray-400"
            />
              <button
                onClick={addCustomLabel}
                onMouseDown={(e) => e.stopPropagation()} // Allow clicking button
                disabled={!labelInput.trim()}
                className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Labels Summary */}
      {labels.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
    </div>
  );
}