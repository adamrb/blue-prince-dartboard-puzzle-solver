import { DartBoardSegment, BullseyeState } from '../types/DartBoard';
import { calculateEquation } from './dartboardUtils';

export interface SavedPuzzle {
  id: string;        // Unique identifier (timestamp-based)
  savedAt: number;   // Timestamp for display purposes
  segments: DartBoardSegment[];
  bullseye: BullseyeState;
  result: number;    // The calculated result of the puzzle
}

const STORAGE_KEY = 'dartboardPuzzles';

/**
 * Get all saved puzzles from localStorage
 */
export const getSavedPuzzles = (): SavedPuzzle[] => {
  try {
    const savedPuzzles = localStorage.getItem(STORAGE_KEY);
    return savedPuzzles ? JSON.parse(savedPuzzles) : [];
  } catch (error) {
    console.error('Error retrieving saved puzzles:', error);
    return [];
  }
};

/**
 * Save a puzzle to localStorage
 * Only saves if there's at least one active operation
 */
export const savePuzzle = (segments: DartBoardSegment[], bullseye: BullseyeState): SavedPuzzle | null => {
  // Check if there's at least one active operation in any segment or bullseye
  const hasActiveSegment = segments.some(segment => 
    segment.innerSegment.operation !== null ||
    segment.tripleRing.operation !== null ||
    segment.mainSegment.operation !== null ||
    segment.doubleRing.operation !== null ||
    segment.outerRing.operation !== null
  );

  const hasActiveBullseye = 
    bullseye.innerBullseye.operation !== null ||
    bullseye.outerBullseye.operation !== null ||
    bullseye.color !== null ||
    bullseye.innerAction !== null ||
    bullseye.outerAction !== null;

  // Don't save empty boards
  if (!hasActiveSegment && !hasActiveBullseye) {
    return null;
  }

  try {
    const savedPuzzles = getSavedPuzzles();
    
    // Calculate the result
    const calculation = calculateEquation(segments, bullseye);
    
    // Create new puzzle entry
    const newPuzzle: SavedPuzzle = {
      id: `puzzle-${Date.now()}`,
      savedAt: Date.now(),
      segments: JSON.parse(JSON.stringify(segments)), // Deep copy
      bullseye: JSON.parse(JSON.stringify(bullseye)), // Deep copy
      result: calculation.result
    };
    
    // Add to start of array (newest first)
    savedPuzzles.unshift(newPuzzle);
    
    // Limit to max 50 puzzles to avoid storage issues
    const limitedPuzzles = savedPuzzles.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedPuzzles));
    return newPuzzle;
  } catch (error) {
    console.error('Error saving puzzle:', error);
    return null;
  }
};

/**
 * Delete a specific puzzle from localStorage
 */
export const deletePuzzle = (puzzleId: string): boolean => {
  try {
    const savedPuzzles = getSavedPuzzles();
    const filteredPuzzles = savedPuzzles.filter(puzzle => puzzle.id !== puzzleId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPuzzles));
    return true;
  } catch (error) {
    console.error('Error deleting puzzle:', error);
    return false;
  }
};

/**
 * Clear all saved puzzles from localStorage
 */
export const clearAllPuzzles = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing puzzles:', error);
    return false;
  }
};

/**
 * Format a date for display
 */
export const formatSavedDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
