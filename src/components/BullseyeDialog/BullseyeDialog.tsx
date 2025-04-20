import React, { useState } from 'react';
import { BullseyeActionType, BullseyeColor, BullseyeState } from '../../types/DartBoard';
import { getBullseyeActionSymbol, getSymbolScaling } from '../../utils/dartboardUtils';
import styles from './BullseyeDialog.module.css';

interface BullseyeDialogProps {
  isOpen: boolean;
  currentState: BullseyeState;
  onClose: () => void;
  onSave: (state: BullseyeState) => void;
}

const BullseyeDialog: React.FC<BullseyeDialogProps> = ({ 
  isOpen, 
  currentState, 
  onClose, 
  onSave 
}) => {
  const [state, setState] = useState<BullseyeState>(currentState);

  if (!isOpen) return null;

  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialogContent}>
        <h2>Configure Bullseye</h2>
        
        <div className={styles.section}>
          <h3>Color</h3>
          <div className={styles.colorOptions}>
            <button 
              className={`${styles.colorButton} ${styles.blueButton} ${state.color === 'blue' ? styles.selected : ''}`}
              onClick={() => setState({...state, color: 'blue'})}
            >
              Blue (Addition)
            </button>
            <button 
              className={`${styles.colorButton} ${styles.yellowButton} ${state.color === 'yellow' ? styles.selected : ''}`}
              onClick={() => setState({...state, color: 'yellow'})}
            >
              Yellow (Subtraction)
            </button>
            <button 
              className={`${styles.colorButton} ${styles.pinkButton} ${state.color === 'pink' ? styles.selected : ''}`}
              onClick={() => setState({...state, color: 'pink'})}
            >
              Pink (Multiplication)
            </button>
            <button 
              className={`${styles.colorButton} ${styles.purpleButton} ${state.color === 'purple' ? styles.selected : ''}`}
              onClick={() => setState({...state, color: 'purple'})}
            >
              Purple (Division)
            </button>
            <button 
              className={`${styles.colorButton} ${state.color === null ? styles.selected : ''}`}
              onClick={() => setState({...state, color: null})}
            >
              None
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Inner Symbol (Optional)</h3>
          <div className={styles.actionOptions}>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'square' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'square' ? null : 'square'})}
            >
              <span>{getBullseyeActionSymbol('square')}</span> Square (n²)
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'twoSquares' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'twoSquares' ? null : 'twoSquares'})}
            >
              <span>{getBullseyeActionSymbol('twoSquares')}</span> Two Squares (n⁴)
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'diamond' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'diamond' ? null : 'diamond'})}
            >
              <span>{getBullseyeActionSymbol('diamond')}</span> Diamond (reverse)
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'singleWavy' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'singleWavy' ? null : 'singleWavy'})}
            >
              <span>{getBullseyeActionSymbol('singleWavy')}</span> Round to 1
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'doubleWavy' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'doubleWavy' ? null : 'doubleWavy'})}
            >
              <span>{getBullseyeActionSymbol('doubleWavy')}</span> Round to 10
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'tripleWavy' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'tripleWavy' ? null : 'tripleWavy'})}
            >
              <span>{getBullseyeActionSymbol('tripleWavy')}</span> Round to 100
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'oneThirdFull' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'oneThirdFull' ? null : 'oneThirdFull'})}
            >
              <span>{getBullseyeActionSymbol('oneThirdFull')}</span> Divide by 3
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'twoDots' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'twoDots' ? null : 'twoDots'})}
            >
              <span>{getBullseyeActionSymbol('twoDots')}</span> Repeat 2×
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'threeDots' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'threeDots' ? null : 'threeDots'})}
            >
              <span>{getBullseyeActionSymbol('threeDots')}</span> Repeat 3×
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === 'fourDots' ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: state.innerAction === 'fourDots' ? null : 'fourDots'})}
            >
              <span>{getBullseyeActionSymbol('fourDots')}</span> Repeat 4×
            </button>
            <button 
              className={`${styles.actionButton} ${state.innerAction === null ? styles.selected : ''}`}
              onClick={() => setState({...state, innerAction: null})}
            >
              None
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Outer Symbol</h3>
          <div className={styles.actionOptions}>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'square' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'square' ? null : 'square'})}
            >
              <span>{getBullseyeActionSymbol('square')}</span> Square (n²)
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'twoSquares' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'twoSquares' ? null : 'twoSquares'})}
            >
              <span>{getBullseyeActionSymbol('twoSquares')}</span> Two Squares (n⁴)
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'diamond' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'diamond' ? null : 'diamond'})}
            >
              <span>{getBullseyeActionSymbol('diamond')}</span> Diamond (reverse)
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'singleWavy' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'singleWavy' ? null : 'singleWavy'})}
            >
              <span>{getBullseyeActionSymbol('singleWavy')}</span> Round to 1
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'doubleWavy' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'doubleWavy' ? null : 'doubleWavy'})}
            >
              <span>{getBullseyeActionSymbol('doubleWavy')}</span> Round to 10
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'tripleWavy' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'tripleWavy' ? null : 'tripleWavy'})}
            >
              <span>{getBullseyeActionSymbol('tripleWavy')}</span> Round to 100
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'oneThirdFull' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'oneThirdFull' ? null : 'oneThirdFull'})}
            >
              <span>{getBullseyeActionSymbol('oneThirdFull')}</span> Divide by 3
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'twoDots' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'twoDots' ? null : 'twoDots'})}
            >
              <span>{getBullseyeActionSymbol('twoDots')}</span> Repeat 2×
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'threeDots' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'threeDots' ? null : 'threeDots'})}
            >
              <span>{getBullseyeActionSymbol('threeDots')}</span> Repeat 3×
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === 'fourDots' ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: state.outerAction === 'fourDots' ? null : 'fourDots'})}
            >
              <span>{getBullseyeActionSymbol('fourDots')}</span> Repeat 4×
            </button>
            <button 
              className={`${styles.actionButton} ${state.outerAction === null ? styles.selected : ''}`}
              onClick={() => setState({...state, outerAction: null})}
            >
              None
            </button>
          </div>
        </div>
        
        <div className={styles.preview}>
          <h3>Preview</h3>
          <div 
            className={styles.bullseyePreview}
            style={{
              backgroundColor: state.color === 'blue' ? '#2196F3' : 
                              state.color === 'yellow' ? '#FFEB3B' :
                              state.color === 'pink' ? '#FF4081' :
                              state.color === 'purple' ? '#9C27B0' : '#ccc'
            }}
          >
            {/* SVG container for consistent symbol rendering */}
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              {state.outerAction && (() => {
                // Use 50 as the radius of the preview bullseye
                const scaling = getSymbolScaling(state.outerAction, false, 50);
                // Scale to fit the preview circle
                const fontSize = scaling.fontSize * 0.8; 
                
                return (
                  <text
                    x="50"
                    y="56"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.previewSymbol}
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      fill: 'white',
                      opacity: 0.8 
                    }}
                  >
                    {getBullseyeActionSymbol(state.outerAction)}
                  </text>
                );
              })()}
              
              {state.innerAction && (() => {
                // Use 50 as the radius of the preview bullseye
                const scaling = getSymbolScaling(state.innerAction, true, 50);
                // Scale to fit the preview circle
                const fontSize = scaling.fontSize * 0.8;
                
                return (
                  <text
                    x="50"
                    y="56"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.previewSymbol}
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      fill: 'white' 
                    }}
                  >
                    {getBullseyeActionSymbol(state.innerAction)}
                  </text>
                );
              })()}
            </svg>
          </div>
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

export default BullseyeDialog;
