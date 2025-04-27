import React, { useState, useEffect } from 'react';
import { DartBoardSegment, BullseyeState } from '../../types/DartBoard';
import { getSavedPuzzles, deletePuzzle, clearAllPuzzles, SavedPuzzle, formatSavedDate } from '../../utils/storageUtils';
import DartBoard from '../DartBoard/DartBoard';
import styles from './HistoryBrowser.module.css';

interface HistoryBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPuzzle: (segments: DartBoardSegment[], bullseye: BullseyeState) => void;
}

const HistoryBrowser: React.FC<HistoryBrowserProps> = ({ isOpen, onClose, onLoadPuzzle }) => {
  const [savedPuzzles, setSavedPuzzles] = useState<SavedPuzzle[]>([]);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);

  // Load saved puzzles when the component opens
  useEffect(() => {
    if (isOpen) {
      const puzzles = getSavedPuzzles();
      setSavedPuzzles(puzzles);
      setSelectedPuzzleId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoadPuzzle = (puzzle: SavedPuzzle) => {
    onLoadPuzzle(puzzle.segments, puzzle.bullseye);
    onClose();
  };

  const handleDeletePuzzle = (puzzleId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deletePuzzle(puzzleId);
    setSavedPuzzles(savedPuzzles.filter(puzzle => puzzle.id !== puzzleId));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all saved puzzles?')) {
      clearAllPuzzles();
      setSavedPuzzles([]);
    }
  };

  return (
    <div className={styles.historyBrowserOverlay}>
      <div className={styles.historyBrowserModal}>
        <div className={styles.historyBrowserHeader}>
          <h2>Puzzle History</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.historyBrowserContent}>
          {savedPuzzles.length === 0 ? (
            <p className={styles.emptyMessage}>No saved puzzles found</p>
          ) : (
            <ul className={styles.puzzleList}>
              {savedPuzzles.map(puzzle => (
                <li 
                  key={puzzle.id} 
                  className={`${styles.puzzleItem} ${selectedPuzzleId === puzzle.id ? styles.selected : ''}`}
                  onClick={() => setSelectedPuzzleId(puzzle.id)}
                >
                  <div className={styles.thumbnailContainer}>
                    <DartBoard 
                      segments={puzzle.segments}
                      bullseye={puzzle.bullseye}
                      readOnly={true}
                      size={90}
                    />
                  </div>
                  <div className={styles.puzzleDetails}>
                    <div className={styles.puzzleMetadata}>
                      <div className={styles.puzzleDate}>{formatSavedDate(puzzle.savedAt)}</div>
                      <div className={styles.puzzleResult}>Result: <strong>{puzzle.result}</strong></div>
                    </div>
                    <div className={styles.puzzleActions}>
                      <button 
                        className={styles.loadButton}
                        onClick={() => handleLoadPuzzle(puzzle)}
                      >
                        Load
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={(e) => handleDeletePuzzle(puzzle.id, e)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className={styles.historyBrowserFooter}>
          {savedPuzzles.length > 0 && (
            <button 
              className={styles.clearAllButton}
              onClick={handleClearAll}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryBrowser;
