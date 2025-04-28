import { DartBoardSegment, BullseyeState, BullseyeColor, BullseyeActionType, OuterRingState } from '../types/DartBoard';
import { initializeBullseyeState, initializeDartBoardSegments } from './dartboardUtils';

/**
 * Converts puzzle state to a URL parameter string
 * Format is designed to be compact yet human-readable
 */
export const puzzleToUrlParams = (segments: DartBoardSegment[], bullseye: BullseyeState): string => {
  // Skip if there are no segments or bullseye
  if (!segments || !segments.length || !bullseye) {
    return '';
  }

  // Serialize segments with operations
  const segmentParams = segments
    .map((segment) => {
      const parts = [];
      
      // Format: segmentId:number:part:operation:state
      // Only include segments with operations or special states
      
      // Only include segment number (not segment.id) since we match by number when loading
      if (segment.innerSegment.operation !== null) {
        parts.push(`${segment.number}:i:${operationToCode(segment.innerSegment.operation)}${segment.innerSegment.isPartial ? ':p' : ''}`);
      }
      
      if (segment.tripleRing.operation !== null) {
        parts.push(`${segment.number}:t:${operationToCode(segment.tripleRing.operation)}${segment.tripleRing.isPartial ? ':p' : ''}`);
      }
      
      if (segment.mainSegment.operation !== null) {
        parts.push(`${segment.number}:m:${operationToCode(segment.mainSegment.operation)}${segment.mainSegment.isPartial ? ':p' : ''}`);
      }
      
      if (segment.doubleRing.operation !== null) {
        parts.push(`${segment.number}:d:${operationToCode(segment.doubleRing.operation)}${segment.doubleRing.isPartial ? ':p' : ''}`);
      }
      
      if (segment.outerRing.operation !== null || segment.outerRing.outerRingState !== 'normal') {
        parts.push(
          `${segment.number}:o:${operationToCode(segment.outerRing.operation)}:${outerRingStateToCode(segment.outerRing.outerRingState)}`
        );
      }

      return parts;
    })
    .flat()
    .filter(Boolean)
    .join(',');

  // Serialize bullseye state
  const bullseyeParts = [];

  if (bullseye.innerBullseye.operation !== null) {
    bullseyeParts.push(`ib:${operationToCode(bullseye.innerBullseye.operation)}`);
  }

  if (bullseye.outerBullseye.operation !== null) {
    bullseyeParts.push(`ob:${operationToCode(bullseye.outerBullseye.operation)}`);
  }

  if (bullseye.color) {
    bullseyeParts.push(`c:${bullseyeColorToCode(bullseye.color)}`);
  }

  if (bullseye.innerAction) {
    bullseyeParts.push(`ia:${bullseyeActionToCode(bullseye.innerAction)}`);
  }

  if (bullseye.outerAction) {
    bullseyeParts.push(`oa:${bullseyeActionToCode(bullseye.outerAction)}`);
  }

  const bullseyeParams = bullseyeParts.join(',');

  // Combine params
  const params = [];
  if (segmentParams) params.push(`s=${segmentParams}`);
  if (bullseyeParams) params.push(`b=${bullseyeParams}`);

  return params.join('&');
};

/**
 * Converts URL parameter string back to puzzle state
 */
export const urlParamsToPuzzle = (
  paramString: string, 
  numberOrder: number[] = [6, 10, 15, 1, 18, 4, 13, 2, 20, 5, 12, 9, 14, 11, 8, 16, 7, 19, 3, 17]
): { segments: DartBoardSegment[]; bullseye: BullseyeState } | null => {
  try {
    // Initialize default state
    const segments = initializeDartBoardSegments(numberOrder);
    const bullseye = initializeBullseyeState();

    // Extract URL parameters
    const params = new URLSearchParams(paramString);
    
    // Parse segment parameters
    const segmentParam = params.get('s');
    if (segmentParam) {
      segmentParam.split(',').forEach((segmentStr) => {
        const parts = segmentStr.split(':');
        
        if (parts.length < 3) return; // Skip if insufficient data
        
        const number = parseInt(parts[0], 10);
        const part = parts[1];
        const operation = codeToOperation(parts[2]);
        const isPartial = parts.length > 3 && parts[3] === 'p';
        const state = part === 'o' && parts.length > 3 ? codeToOuterRingState(parts[3]) : 'normal';
        
        // Find matching segment by number only
        const segment = segments.find(s => s.number === number);
        if (!segment) {
          console.log(`❌ Could not find segment with number ${number}`);
          return;
        }
        console.log(`✅ Found segment with number ${number}, applying operation ${operation} to ${part} part`);
        
        // Update segment part
        switch (part) {
          case 'i':
            segment.innerSegment.operation = operation;
            segment.innerSegment.isPartial = isPartial;
            break;
          case 't':
            segment.tripleRing.operation = operation;
            segment.tripleRing.isPartial = isPartial;
            break;
          case 'm':
            segment.mainSegment.operation = operation;
            segment.mainSegment.isPartial = isPartial;
            break;
          case 'd':
            segment.doubleRing.operation = operation;
            segment.doubleRing.isPartial = isPartial;
            break;
          case 'o':
            segment.outerRing.operation = operation;
            segment.outerRing.outerRingState = state;
            break;
          default:
            break;
        }
      });
    }
    
    // Parse bullseye parameters
    const bullseyeParam = params.get('b');
    if (bullseyeParam) {
      bullseyeParam.split(',').forEach((bullPart) => {
        const parts = bullPart.split(':');
        
        if (parts.length !== 2) return; // Skip if incorrect format
        
        const key = parts[0];
        const value = parts[1];
        
        switch (key) {
          case 'ib':
            bullseye.innerBullseye.operation = codeToOperation(value);
            break;
          case 'ob':
            bullseye.outerBullseye.operation = codeToOperation(value);
            break;
          case 'c':
            bullseye.color = codeToBullseyeColor(value);
            break;
          case 'ia':
            bullseye.innerAction = codeToBullseyeAction(value);
            break;
          case 'oa':
            bullseye.outerAction = codeToBullseyeAction(value);
            break;
          default:
            break;
        }
      });
    }

    return { segments, bullseye };
  } catch (error) {
    console.error('Error parsing URL parameters:', error);
    return null;
  }
};

/**
 * Update browser URL with puzzle parameters without page reload
 */
export const updateBrowserUrl = (segments: DartBoardSegment[], bullseye: BullseyeState) => {
  const paramString = puzzleToUrlParams(segments, bullseye);
  
  // Only update if we have parameters to set
  if (paramString) {
    // Create base URL without search params
    const baseUrl = window.location.href.split('?')[0];
    const newUrl = `${baseUrl}${paramString ? '?' + paramString : ''}`;
    
    // Update URL without causing a page reload
    window.history.replaceState({}, '', newUrl);
  }
};

/**
 * Check if URL contains puzzle parameters
 */
export const hasPuzzleInUrl = (): boolean => {
  const url = new URL(window.location.href);
  return url.searchParams.has('s') || url.searchParams.has('b');
};

/**
 * Clear all URL parameters without page reload
 */
export const clearUrlParameters = (): void => {
  const baseUrl = window.location.href.split('?')[0];
  window.history.replaceState({}, '', baseUrl);
};

/**
 * Get puzzle from current URL if available
 */
export const getPuzzleFromUrl = (
  numberOrder: number[] = [6, 10, 15, 1, 18, 4, 13, 2, 20, 5, 12, 9, 14, 11, 8, 16, 7, 19, 3, 17]
): { segments: DartBoardSegment[]; bullseye: BullseyeState } | null => {
  console.log('🔍 getPuzzleFromUrl - Checking URL for puzzle parameters');
  
  const url = new URL(window.location.href);
  console.log('📌 Current URL:', url.toString());
  
  const paramString = url.search.substring(1); // Remove the leading '?'
  console.log('📝 URL param string:', paramString || '(empty)');
  
  if (!paramString) {
    console.log('❌ No URL parameters found');
    return null;
  }
  
  console.log('✅ URL parameters found, attempting to parse');
  const puzzleState = urlParamsToPuzzle(paramString, numberOrder);
  
  if (puzzleState) {
    console.log('✅ Successfully parsed puzzle from URL');
    console.log('🧩 Segment count with operations:', 
      puzzleState.segments.filter(s => 
        s.innerSegment.operation !== null || 
        s.tripleRing.operation !== null || 
        s.mainSegment.operation !== null || 
        s.doubleRing.operation !== null || 
        s.outerRing.operation !== null
      ).length
    );
    console.log('🎯 Bullseye has values:', 
      puzzleState.bullseye.innerBullseye.operation !== null || 
      puzzleState.bullseye.outerBullseye.operation !== null || 
      puzzleState.bullseye.color !== null || 
      puzzleState.bullseye.innerAction !== null || 
      puzzleState.bullseye.outerAction !== null
    );
  } else {
    console.log('❌ Failed to parse puzzle from URL parameters');
  }
  
  return puzzleState;
};

// Helper functions for compact representation in URL
const operationToCode = (operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null): string => {
  switch (operation) {
    case 'addition': return 'a';
    case 'subtraction': return 's';
    case 'multiplication': return 'm';
    case 'division': return 'd';
    default: return 'n';
  }
};

const codeToOperation = (code: string): 'addition' | 'subtraction' | 'multiplication' | 'division' | null => {
  switch (code) {
    case 'a': return 'addition';
    case 's': return 'subtraction';
    case 'm': return 'multiplication';
    case 'd': return 'division';
    default: return null;
  }
};

const outerRingStateToCode = (state: string): string => {
  switch (state) {
    case 'normal': return 'n';
    case 'cross': return 'x';
    case 'diagonalLine': return 'dl';
    case 'twoDots': return '2d';
    case 'threeDots': return '3d';
    case 'fourDots': return '4d';
    case 'square': return 'sq';
    case 'twoSquares': return '2s';
    case 'diamond': return 'di';
    case 'singleWavy': return '1w';
    case 'doubleWavy': return '2w';
    case 'tripleWavy': return '3w';
    case 'oneThirdFull': return '1t';
    default: return 'n';
  }
};

const codeToOuterRingState = (code: string): OuterRingState => {
  switch (code) {
    case 'n': return 'normal';
    case 'x': return 'cross';
    case 'dl': return 'diagonalLine';
    case '2d': return 'twoDots';
    case '3d': return 'threeDots';
    case '4d': return 'fourDots';
    case 'sq': return 'square';
    case '2s': return 'twoSquares';
    case 'di': return 'diamond';
    case '1w': return 'singleWavy';
    case '2w': return 'doubleWavy';
    case '3w': return 'tripleWavy';
    case '1t': return 'oneThirdFull';
    default: return 'normal';
  }
};

const bullseyeColorToCode = (color: BullseyeColor): string => {
  switch (color) {
    case 'blue': return 'b';
    case 'yellow': return 'y';
    case 'pink': return 'p';
    case 'purple': return 'pu';
    default: return 'n';
  }
};

const codeToBullseyeColor = (code: string): BullseyeColor => {
  switch (code) {
    case 'b': return 'blue';
    case 'y': return 'yellow';
    case 'p': return 'pink';
    case 'pu': return 'purple';
    default: return null;
  }
};

const bullseyeActionToCode = (action: BullseyeActionType): string => {
  switch (action) {
    case 'square': return 'sq';
    case 'twoSquares': return '2s';
    case 'diamond': return 'di';
    case 'singleWavy': return '1w';
    case 'doubleWavy': return '2w';
    case 'tripleWavy': return '3w';
    case 'oneThirdFull': return '1t';
    case 'twoDots': return '2d';
    case 'threeDots': return '3d';
    case 'fourDots': return '4d';
    default: return '';
  }
};

const codeToBullseyeAction = (code: string): BullseyeActionType | null => {
  switch (code) {
    case 'sq': return 'square';
    case '2s': return 'twoSquares';
    case 'di': return 'diamond';
    case '1w': return 'singleWavy';
    case '2w': return 'doubleWavy';
    case '3w': return 'tripleWavy';
    case '1t': return 'oneThirdFull';
    case '2d': return 'twoDots';
    case '3d': return 'threeDots';
    case '4d': return 'fourDots';
    default: return null;
  }
};
