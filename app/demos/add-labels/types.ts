export interface Label {
  id: string;
  text: string;
  label: string;
  startWordIndex: number;
  endWordIndex: number;
  color: string;
}

export interface SelectionRange {
  startWordIndex: number;
  endWordIndex: number;
}

export interface PopupPosition {
  x: number;
  y: number;
}

export interface ExportData {
  text: string;
  labels: Array<{
    text: string;
    label: string;
    startWordIndex: number;
    endWordIndex: number;
  }>;
  metadata: {
    exportDate: string;
    totalLabels: number;
  };
}
