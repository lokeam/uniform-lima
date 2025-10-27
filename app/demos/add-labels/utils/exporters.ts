import type { Label, ExportData } from '../types';

/**
 * Downloads a file with given content
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports labels as JSON format
 */
export function exportToJSON(labels: Label[], sourceText: string): void {
  const data: ExportData = {
    text: sourceText,
    labels: labels.map(l => ({
      text: l.text,
      label: l.label,
      startWordIndex: l.startWordIndex,
      endWordIndex: l.endWordIndex,
    })),
    metadata: {
      exportDate: new Date().toISOString(),
      totalLabels: labels.length,
    },
  };

  downloadFile(JSON.stringify(data, null, 2), 'text-labels.json', 'application/json');
}

/**
 * Exports labels as CSV format
 */
export function exportToCSV(labels: Label[]): void {
  const headers = ['text', 'label', 'start_index', 'end_index'];
  const rows = labels.map(l => [
    // Escape quotes
    `"${l.text.replace(/"/g, '""')}"`,
    l.label,
    l.startWordIndex.toString(),
    l.endWordIndex.toString(),
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  downloadFile(csv, 'text-labels.csv', 'text/csv');
}

/**
 * Exports labels as JSONL (JSON Lines) format - common for NLP datasets
 */
export function exportToJSONL(labels: Label[], sourceText: string): void {
  const jsonl = labels
    .map(l => JSON.stringify({
      text: l.text,
      label: l.label,
      startWordIndex: l.startWordIndex,
      endWordIndex: l.endWordIndex,
      context: sourceText.slice(
        Math.max(0, l.startWordIndex - 50),
        Math.min(sourceText.length, l.endWordIndex + 50)
      ),
    }))
    .join('\n');

    downloadFile(jsonl, 'text-labels.jsonl', 'application/x-ndjson');
}
