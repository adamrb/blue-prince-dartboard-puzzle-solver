import React, { useState, useEffect } from 'react';
import { DartBoardSegmentPart } from '../../types/DartBoard';
import styles from './SegmentDialog.module.css';

interface SegmentDialogProps {
  isOpen: boolean;
  partType: 'innerSegment' | 'tripleRing' | 'mainSegment' | 'doubleRing' | 'outerRing';
  segmentNumber: number;
  currentState: DartBoardSegmentPart;
  onClose: () => void;
  onSave: (updatedState: DartBoardSegmentPart) => void;
}

const SegmentDialog: React.FC<SegmentDialogProps> = ({ 
  isOpen, 
  partType,
  segmentNumber,
  currentState, 
  onClose, 
  onSave 
}) => {
  const [state, setState] = useState<DartBoardSegmentPart>(currentState);

  // Reset state whenever currentState changes or dialog opens
  useEffect(() => {
    setState(currentState);
  }, [currentState, isOpen]);

  if (!isOpen) return null;

  // Create a readable part type name for display
  const getPartTypeName = () => {
    switch(partType) {
      case 'innerSegment': return 'Inner Segment';
      case 'tripleRing': return 'Triple Ring';
      case 'mainSegment': return 'Main Segment';
      case 'doubleRing': return 'Double Ring';
      case 'outerRing': return 'Outer Ring';
      default: return 'Segment';
    }
  };

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <h2>Configure {getPartTypeName()} {segmentNumber}</h2>
        
        <div className={styles.section}>
          <h3>Operation</h3>
          <div className={styles.operationOptions}>
            <button 
              className={`${styles.operationButton} ${styles.blueButton} ${state.operation === 'addition' ? styles.selected : ''}`}
              onClick={() => setState(prev => ({
                ...prev, 
                operation: 'addition',
                ...(prev.operation === null ? { isPartial: false } : {})
              }))}
            >
              Blue (Addition)
            </button>
            <button 
              className={`${styles.operationButton} ${styles.yellowButton} ${state.operation === 'subtraction' ? styles.selected : ''}`}
              onClick={() => setState(prev => ({
                ...prev, 
                operation: 'subtraction',
                ...(prev.operation === null ? { isPartial: false } : {})
              }))}
            >
              Yellow (Subtraction)
            </button>
            <button 
              className={`${styles.operationButton} ${styles.pinkButton} ${state.operation === 'multiplication' ? styles.selected : ''}`}
              onClick={() => setState(prev => ({
                ...prev, 
                operation: 'multiplication',
                ...(prev.operation === null ? { isPartial: false } : {})
              }))}
            >
              Pink (Multiplication)
            </button>
            <button 
              className={`${styles.operationButton} ${styles.purpleButton} ${state.operation === 'division' ? styles.selected : ''}`}
              onClick={() => setState(prev => ({
                ...prev, 
                operation: 'division',
                ...(prev.operation === null ? { isPartial: false } : {})
              }))}
            >
              Purple (Division)
            </button>
          </div>
        </div>

        {state.operation !== null && (
          <div className={styles.section}>
            <h3>Fill Type</h3>
            <div className={styles.fillOptions}>
              <button 
                className={`${styles.fillButton} ${!state.isPartial ? styles.selected : ''}`}
                onClick={() => setState({...state, isPartial: false})}
              >
                Full Fill
              </button>
              <button 
                className={`${styles.fillButton} ${state.isPartial ? styles.selected : ''}`}
                onClick={() => setState({...state, isPartial: true})}
              >
                Partial Fill (1/3)
              </button>
            </div>
          </div>
        )}

        <div className={styles.buttonRow}>
          <button 
            className={styles.clearButton} 
            onClick={() => setState({...state, operation: null, isPartial: false})}
          >
            Clear Color
          </button>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button 
            className={styles.saveButton} 
            onClick={() => {
              onSave(state);
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

export default SegmentDialog;
