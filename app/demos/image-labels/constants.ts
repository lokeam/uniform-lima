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
