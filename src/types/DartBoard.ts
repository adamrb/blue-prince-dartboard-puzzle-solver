export interface DartBoardSegmentPart {
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null;
  isPartial?: boolean; // Indicates if segment should be 1/3 filled
}

// Outer ring state type
export type OuterRingState = 
  | 'normal' 
  | 'cross' 
  | 'diagonalLine'
  | 'twoDots'
  | 'threeDots'    // New - repeat 3 times
  | 'fourDots'     // New - repeat 4 times
  | 'square'       // New - n²
  | 'twoSquares'   // New - n⁴
  | 'diamond'      // New - reverse numbers
  | 'singleWavy'   // New - round to nearest 1
  | 'doubleWavy'   // New - round to nearest 10
  | 'tripleWavy'   // New - round to nearest 100
  | 'oneThirdFull'; // New - divide by 3

export interface DartBoardSegment {
  id: number;
  number: number;
  outerRing: DartBoardSegmentPart & { outerRingState: OuterRingState };
  doubleRing: DartBoardSegmentPart;
  mainSegment: DartBoardSegmentPart;
  tripleRing: DartBoardSegmentPart;
  innerSegment: DartBoardSegmentPart;
}

export type BullseyeActionType = 
  | 'square'
  | 'twoSquares'  // New - n⁴
  | 'diamond' 
  | 'singleWavy'
  | 'doubleWavy'
  | 'tripleWavy'
  | 'oneThirdFull'  // New - divide by 3
  | 'twoDots'      // New - repeat 2 times
  | 'threeDots'    // New - repeat 3 times
  | 'fourDots'     // New - repeat 4 times
  | null;

export type BullseyeColor = 'blue' | 'yellow' | 'pink' | 'purple' | null;

export interface BullseyeState {
  outerBullseye: DartBoardSegmentPart;
  innerBullseye: DartBoardSegmentPart;
  color: BullseyeColor;
  innerAction: BullseyeActionType;
  outerAction: BullseyeActionType;
}

export interface DartBoardConfig {
  // Order of numbers around the board, starting from the top and going clockwise
  numberOrder: number[];
  // Total number of segments
  segmentCount: number;
  // Radius of the dart board in SVG units
  boardRadius: number;
  // Ring widths as percentages of the board radius
  ringWidths?: {
    outerRing?: number;    // Width of outermost functional ring
    numberRing?: number;   // Width of the numbers ring
    doubleRing?: number;   // Width of double scoring ring
    mainSegment?: number;  // Width of main segment area
    tripleRing?: number;   // Width of triple scoring ring
    innerSegment?: number; // Width of inner segment area
    bullseye?: number;     // Width of outer bullseye ring
    bullseyeBorder?: number; // Width of the border between outer and inner bullseye (as % of bullseye)
  }
}

export interface DartBoardState {
  segments: DartBoardSegment[];
}
