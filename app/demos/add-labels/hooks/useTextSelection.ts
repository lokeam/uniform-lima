import { useState, useRef } from 'react';

// Types
import type { SelectionRange, PopupPosition } from '@/app/demos/add-labels/types';

// Constants
import { POPUP_OFFSET_Y } from '@/app/demos/add-labels/constants';

export function useTextSelection(
  textRef: React.RefObject<HTMLDivElement | null>,
  sourceText: string
) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<SelectionRange | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowPopup(false);
      return;
    }

    const rawText = selection.toString();
    const text = rawText.trim();
    if (!text || !textRef.current) {
      setShowPopup(false);
      return;
    }

    // Grab selection position relative to the text container
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = textRef.current.getBoundingClientRect();

    // Save the range so we can restore it later
    savedRangeRef.current = range.cloneRange();

    // Calculate position for popup (centered above selection)
    const x = rect.left + rect.width / 2 - containerRect.left;
    const y = rect.top - containerRect.top - POPUP_OFFSET_Y;

    // DEBUG: Log range details
    console.log('Range details:', {
      startContainer: range.startContainer,
      startContainerText: range.startContainer.textContent,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endContainerText: range.endContainer.textContent,
      endOffset: range.endOffset,
      sameContainer: range.startContainer === range.endContainer,
      rangeToString: range.toString(),
      rawText,
      trimmedText: text
    });

    // Word-based approach: Split source text into words and find which words were selected
    const words = sourceText.split(/\s+/);

    // Get text before the selection, excluding labeled text and tooltips
    let textBefore = '';
    const walker = document.createTreeWalker(
      textRef.current,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip text nodes inside TOOLTIP spans only
          // We WANT to count labeled text because it's still part of the sentence
          let parent = node.parentElement;
          while (parent && parent !== textRef.current) {
            if (parent.getAttribute('data-tooltip') === 'true') {
              return NodeFilter.FILTER_REJECT;
            }
            parent = parent.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node === range.startContainer) {
        // Add only the part before the selection in this node
        textBefore += node.textContent?.slice(0, range.startOffset) || '';
        break;
      } else {
        textBefore += node.textContent || '';
      }
    }

    // Count words before selection (this gives us the start word index)
    const wordsBefore = textBefore.trim().split(/\s+/).filter(w => w.length > 0);
    const startWordIndex = wordsBefore.length;

    console.log('DEBUG textBefore:', {
      textBefore,
      textBeforeWords: wordsBefore,
      count: wordsBefore.length
    });

    // Count words in the selection
    const selectedWords = text.trim().split(/\s+/).filter(w => w.length > 0);
    const endWordIndex = startWordIndex + selectedWords.length - 1;

    // Verify the selection matches the source words
    const expectedText = words.slice(startWordIndex, endWordIndex + 1).join(' ');
    if (expectedText !== text.trim()) {
      console.error('Word index mismatch:', { expectedText, actualText: text.trim(), startWordIndex, endWordIndex });
      setShowPopup(false);
      return;
    }

    // Debug logging
    console.log('Selection debug:', {
      selectedText: text,
      rawText,
      startWordIndex,
      endWordIndex,
      wordsBefore: wordsBefore.length,
      selectedWords: selectedWords.length,
      reconstructed: words.slice(startWordIndex, endWordIndex + 1).join(' ')
    });

    setSelectedText(text);
    setSelectedRange({ startWordIndex, endWordIndex });
    setPopupPosition({ x, y });
    setShowPopup(true);

    // Keep the selection visible by restoring it after a brief delay
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

  const clearSelection = () => {
    setShowPopup(false);
    setSelectedText('');
    setSelectedRange(null);
    savedRangeRef.current = null;
    window.getSelection()?.removeAllRanges();
  };

  return {
    showPopup,
    setShowPopup,
    popupPosition,
    selectedText,
    selectedRange,
    handleMouseUp,
    clearSelection,
  };
}
