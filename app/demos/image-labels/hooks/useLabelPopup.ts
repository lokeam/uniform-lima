import { useState } from 'react';

export function useLabelPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [pendingBox, setPendingBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [labelInput, setLabelInput] = useState('');

  const openPopup = (
    box: {
      x: number;
      y: number;
      width: number;
      height: number
    }) => {
    setPendingBox(box);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPendingBox(null);
    setLabelInput('');
  };

  const handleLabelSelect = (
    label: string,
    onComplete: (
      box: {
        x: number;
        y: number;
        width: number;
        height: number;
      },
      label: string
    ) => void) => {
    if (!pendingBox) return;

    onComplete(pendingBox, label);
    closePopup();
  };

  return {
    showPopup,
    pendingBox,
    labelInput,
    setLabelInput,
    openPopup,
    closePopup,
    handleLabelSelect,
  };
}
