export const LABEL_COLORS: Record<string, string> = {
  COSMETIC: '#3b82f6',
  MECHANICAL: '#10b981',
  STRUCTURAL: '#f59e0b',
  SAFETY_SYSTEMS: '#8b5cf6',
  CUSTOM: '#ec4899',
};

export const SAMPLE_IMAGE = '/dented_car.jpeg';

export const SUGGESTED_LABELS = ['COSMETIC', 'MECHANICAL', 'STRUCTURAL', 'SAFETY_SYSTEMS'] as const;

export const MIN_BOX_SIZE = 10;

export const TOOLBAR_HOVER_DESCRIPTIONS: Record<string, string> = {
  DEFAULT: 'Hover over a Toolbar button for information Contextual information.',
  UNDO: 'Revert the last action',
  REDO: 'Redo the last action',
  CURSOR: 'Click and drag a previously drawn shape to move it to a different position',
  SQUARE: 'Click and drag on the image to draw bounding boxes.',
  POLYGON: 'Click on the canvas to place polygon points. Click near the first point to close the shape after placing three nodes.',
  DOWNLOAD: 'Download the annotated image.',
  CLEAR: 'Clear all image lables'
};
