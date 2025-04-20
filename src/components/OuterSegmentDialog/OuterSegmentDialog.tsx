import React, { useState, useEffect } from 'react';
import { DartBoardSegmentPart, OuterRingState } from '../../types/DartBoard';
import styles from './OuterSegmentDialog.module.css';

interface OuterSegmentDialogProps {
  isOpen: boolean;
  segmentNumber: number;
  currentState: DartBoardSegmentPart & { outerRingState: OuterRingState };
  onClose: () => void;
  onSave: (updatedState: DartBoardSegmentPart & { outerRingState: OuterRingState }) => void;
}

const OuterSegmentDialog: React.FC<OuterSegmentDialogProps> = ({ 
  isOpen, 
  segmentNumber,
  currentState, 
  onClose, 
  onSave 
}) => {
  const [state, setState] = useState<DartBoardSegmentPart & { outerRingState: OuterRingState }>(currentState);

  // Reset state whenever currentState changes or dialog opens
  useEffect(() => {
    setState(currentState);
  }, [currentState, isOpen]);

  if (!isOpen) return null;

  // Array of all outer ring states for rendering options
  const outerRingStates: { value: OuterRingState; label: string; description: string }[] = [
    { value: 'normal', label: 'Normal', description: 'No special effect' },
    { value: 'cross', label: 'Cross (X)', description: 'Skip this step' },
    { value: 'diagonalLine', label: 'Diagonal Line (/)', description: 'Divide final number by 2' },
    { value: 'twoDots', label: 'Two Dots (··)', description: 'Repeat this step 2 times' },
    { value: 'threeDots', label: 'Three Dots (···)', description: 'Repeat this step 3 times' },
    { value: 'fourDots', label: 'Four Dots (····)', description: 'Repeat this step 4 times' },
    { value: 'square', label: 'Square (□)', description: 'Square the number (n²)' },
    { value: 'twoSquares', label: 'Two Squares (□□)', description: '4th power (n⁴)' },
    { value: 'diamond', label: 'Diamond (◊)', description: 'Reverse digits' },
    { value: 'singleWavy', label: 'Single Wavy (≈)', description: 'Round to nearest 1' },
    { value: 'doubleWavy', label: 'Double Wavy (≈≈)', description: 'Round to nearest 10' },
    { value: 'tripleWavy', label: 'Triple Wavy (≈≈≈)', description: 'Round to nearest 100' },
    { value: 'oneThirdFull', label: 'One Third (⅓)', description: 'Divide by 3' }
  ];

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <h2>Configure Outer Ring {segmentNumber}</h2>
        
        <div className={styles.section}>
          <h3>Modifier</h3>
          <div className={styles.outerRingOptions}>
            {outerRingStates.map((option) => (
              <button 
                key={option.value}
                className={`${styles.outerRingButton} ${state.outerRingState === option.value ? styles.selected : ''}`}
                onClick={() => setState({...state, outerRingState: option.value})}
              >
                <span className={styles.symbolLabel}>{option.label}</span>
                <span className={styles.description}>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button 
            className={styles.saveButton} 
            onClick={() => {
              // Keep existing operation and isPartial values when saving
              onSave({
                ...state,
                operation: currentState.operation,
                isPartial: currentState.isPartial
              });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default OuterSegmentDialog;
