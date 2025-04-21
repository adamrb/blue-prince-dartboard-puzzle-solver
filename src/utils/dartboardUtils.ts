import { DartBoardSegment, BullseyeState, BullseyeActionType, BullseyeColor, OuterRingState } from '../types/DartBoard';
import Fraction from 'fraction.js';

/**
 * Format a number for display:
 * - Integers remain as integers
 * - Decimals are shown with exactly 2 decimal places
 */
export const formatNumber = (value: number): string => {
  // Check if the value is an integer
  if (Number.isInteger(value)) {
    return value.toString();
  }
  
  // Otherwise format to 2 decimal places
  return value.toFixed(2);
};

/**
 * Calculate the X coordinate on a circle given center, radius and angle
 */
export const calcX = (centerX: number, radius: number, angleInDegrees: number): number => {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
  return centerX + radius * Math.cos(angleInRadians);
};

/**
 * Calculate the Y coordinate on a circle given center, radius and angle
 */
export const calcY = (centerY: number, radius: number, angleInDegrees: number): number => {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);
  return centerY + radius * Math.sin(angleInRadians);
};

/**
 * Generate an SVG path for a segment of a circle
 */
export const createSegmentPath = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string => {
  const startOuterX = calcX(centerX, outerRadius, startAngle);
  const startOuterY = calcY(centerY, outerRadius, startAngle);
  const endOuterX = calcX(centerX, outerRadius, endAngle);
  const endOuterY = calcY(centerY, outerRadius, endAngle);
  const startInnerX = calcX(centerX, innerRadius, startAngle);
  const startInnerY = calcY(centerY, innerRadius, startAngle);
  const endInnerX = calcX(centerX, innerRadius, endAngle);
  const endInnerY = calcY(centerY, innerRadius, endAngle);

  // Determine if the segment is larger than 180 degrees
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  // Start at the outer radius start point
  let path = `M ${startOuterX} ${startOuterY}`;
  
  // Arc to the outer radius end point
  path += ` A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`;
  
  // Line to the inner radius end point
  path += ` L ${endInnerX} ${endInnerY}`;
  
  // Arc back to the inner radius start point
  path += ` A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}`;
  
  // Close the path
  path += ' Z';
  
  return path;
};

/**
 * Calculate the position for the number text
 */
export const calcNumberPosition = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  return {
    x: calcX(centerX, radius, angleInDegrees),
    y: calcY(centerY, radius, angleInDegrees)
  };
};

/**
 * Initialize dart board segments based on the number configuration
 */
export const initializeDartBoardSegments = (numberOrder: number[]): DartBoardSegment[] => {
  return numberOrder.map((number, index) => ({
    id: index,
    number,
    outerRing: { operation: null, outerRingState: 'normal' },
    doubleRing: { operation: null },
    mainSegment: { operation: null },
    tripleRing: { operation: null },
    innerSegment: { operation: null }
  }));
};

/**
 * Get the next outer ring state in the cycle
 */
export const getNextOuterRingState = (currentState: OuterRingState): OuterRingState => {
  switch (currentState) {
    case 'normal':
      return 'cross'; // Red X - skip this step
    case 'cross':
      return 'diagonalLine'; // Red / - divide by 2
    case 'diagonalLine':
      return 'twoDots'; // Red dots - repeat 2 times
    case 'twoDots':
      return 'threeDots'; // Red dots - repeat 3 times
    case 'threeDots':
      return 'fourDots'; // Red dots - repeat 4 times
    case 'fourDots':
      return 'square'; // Square - n²
    case 'square':
      return 'twoSquares'; // Two squares - n⁴
    case 'twoSquares':
      return 'diamond'; // Diamond - reverse numbers
    case 'diamond':
      return 'singleWavy'; // Single wavy - round to nearest 1
    case 'singleWavy':
      return 'doubleWavy'; // Double wavy - round to nearest 10
    case 'doubleWavy':
      return 'tripleWavy'; // Triple wavy - round to nearest 100
    case 'tripleWavy':
      return 'oneThirdFull'; // 1/3 full - divide by 3
    case 'oneThirdFull':
      return 'normal'; // Back to normal
    default:
      return 'normal';
  }
};

/**
 * Get the color for a segment based on its operation
 */
export const getOperationColor = (operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null): string => {
  switch (operation) {
    case 'addition':
      return '#2196F3'; // Blue
    case 'subtraction':
      return '#FFEB3B'; // Yellow
    case 'multiplication':
      return '#FF4081'; // Pink
    case 'division':
      return '#9C27B0'; // Purple
    default:
      return ''; // No specific color
  }
};

/**
 * Get the next operation in the cycle
 */
export const getNextOperation = (
  currentOperation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null
): 'addition' | 'subtraction' | 'multiplication' | 'division' | null => {
  switch (currentOperation) {
    case null:
      return 'addition';
    case 'addition':
      return 'subtraction';
    case 'subtraction':
      return 'multiplication';
    case 'multiplication':
      return 'division';
    case 'division':
      return null;
    default:
      return null;
  }
};

/**
 * Initialize bullseye state
 */
export const initializeBullseyeState = (): BullseyeState => {
  return {
    outerBullseye: { operation: null },
    innerBullseye: { operation: null },
    color: null,
    innerAction: null,
    outerAction: null
  };
};

/**
 * Get the bullseye color from operation
 */
export const getBullseyeColorFromOperation = (operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null): BullseyeColor => {
  switch (operation) {
    case 'addition':
      return 'blue';
    case 'subtraction':
      return 'yellow';
    case 'multiplication':
      return 'pink';
    case 'division':
      return 'purple';
    default:
      return null;
  }
};

/**
 * Get the symbol representation of a bullseye action
 */
export const getBullseyeActionSymbol = (action: BullseyeActionType): string => {
  switch (action) {
    case 'square':
      return '□';
    case 'twoSquares':
      return '□□';
    case 'diamond':
      return '◊';
    case 'singleWavy':
      return '≈';
    case 'doubleWavy':
      return '≈≈';
    case 'tripleWavy':
      return '≈≈≈';
    case 'oneThirdFull':
      return '⅓';
    case 'twoDots':
      return '••';
    case 'threeDots':
      return '•••';
    case 'fourDots':
      return '••••';
    default:
      return '';
  }
};

/**
 * Calculate the appropriate symbol scaling based on the bullseye size and symbol type
 */
export const getSymbolScaling = (
  symbolType: BullseyeActionType,
  isInner: boolean,
  bullseyeRadius: number
): { width: number; height: number; fontSize: number } => {
  // Base scaling factors
  const outerScaleFactor = 0.85; // 85% of bullseye for outer symbol
  const innerScaleFactor = 0.4;  // 40% of bullseye for inner symbol
  
  // Font size scaling (as percentage of the container size)
  const outerFontScale = 0.7; // 70% of container width
  const innerFontScale = 0.8; // 80% of container width
  
  // Apply symbol-specific adjustments if needed
  let scaleFactor = isInner ? innerScaleFactor : outerScaleFactor;
  let fontScale = isInner ? innerFontScale : outerFontScale;
  
  // Some symbols might need special handling
  switch (symbolType) {
    case 'diamond':
      // Diamonds might need to be larger
      scaleFactor *= 1.1;
      break;
    case 'tripleWavy':
      // Triple wavy might need to be smaller
      scaleFactor *= 0.9;
      fontScale *= 0.9;
      break;
    case 'doubleWavy':
      // Double wavy might need slight adjustment
      fontScale *= 0.95;
      break;
    default:
      break;
  }
  
  const size = bullseyeRadius * 2 * scaleFactor;
  const fontSize = size * fontScale;
  
  return {
    width: size,
    height: size,
    fontSize: fontSize
  };
};

/**
 * Get text description of a bullseye action
 */
export const getBullseyeActionText = (action: BullseyeActionType): string => {
  switch (action) {
    case 'square':
      return 'Square';
    case 'twoSquares':
      return 'Square twice';
    case 'diamond':
      return 'Reverse numbers';
    case 'singleWavy':
      return 'Round to nearest 1';
    case 'doubleWavy':
      return 'Round to nearest 10';
    case 'tripleWavy':
      return 'Round to nearest 100';
    case 'oneThirdFull':
      return 'Divide by 3';
    case 'twoDots':
      return 'Repeat operation 2 times';
    case 'threeDots':
      return 'Repeat operation 3 times';
    case 'fourDots':
      return 'Repeat operation 4 times';
    default:
      return '';
  }
};

/**
 * Apply bullseye action to a number
 * Uses fraction.js for exact division by 3
 */
export const applyBullseyeAction = (
  value: number, 
  action: BullseyeActionType
): number => {
  switch (action) {
    case 'square':
      return Math.pow(value, 2);
    case 'twoSquares':
      return Math.pow(value, 4); // n⁴ - square the number twice
    case 'diamond':
      return parseInt(Math.abs(value).toString().split('').reverse().join('')) * Math.sign(value);
    case 'singleWavy':
      return Math.round(value);
    case 'doubleWavy':
      return Math.round(value / 10) * 10;
    case 'tripleWavy':
      return Math.round(value / 100) * 100;
    case 'oneThirdFull':
      // Use fraction.js for exact division by 3
      return new Fraction(value).div(3).valueOf();
    // The dot cases (repeat operations) will be handled in the calculateEquation function
    case 'twoDots':
    case 'threeDots':
    case 'fourDots':
      return value; // Just return the value, repeating will be handled separately
    default:
      return value;
  }
};

/**
 * Get the text representation of an operation
 */
export const getOperationText = (operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null): string => {
  switch (operation) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '-';
    case 'multiplication':
      return '×';
    case 'division':
      return '÷';
    default:
      return '';
  }
};

/**
 * Apply an operation to two numbers
 * Uses fraction.js for precise fraction arithmetic, especially for 1/3 values
 */
export const applyOperation = (
  a: number,
  b: number,
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null,
  isPartial: boolean = false
): number => {
  // Create Fraction instances
  const aFraction = new Fraction(a);
  
  // If partial, use exactly 1/3 of the value with fraction precision
  const bFraction = isPartial ? new Fraction(b).div(3) : new Fraction(b);
  
  // Apply the operation using Fraction methods
  switch (operation) {
    case 'addition':
      return aFraction.add(bFraction).valueOf();
    case 'subtraction':
      return aFraction.sub(bFraction).valueOf();
    case 'multiplication':
      return aFraction.mul(bFraction).valueOf();
    case 'division':
      return bFraction.equals(0) ? NaN : aFraction.div(bFraction).valueOf();
    default:
      return a; // No operation, return the first number
  }
};

/**
 * Find active segments (those with operations assigned)
 */
export const findActiveSegments = (segments: DartBoardSegment[]): Array<{
  segment: DartBoardSegment,
  part: 'innerSegment' | 'tripleRing' | 'mainSegment' | 'doubleRing' | 'outerRing',
  distanceFromCenter: number
}> => {
  const activeSegments: Array<{
    segment: DartBoardSegment,
    part: 'innerSegment' | 'tripleRing' | 'mainSegment' | 'doubleRing' | 'outerRing',
    distanceFromCenter: number
  }> = [];

  // Distance from center values (0 is closest, 4 is furthest)
  const distanceMap = {
    innerSegment: 0,
    tripleRing: 1,
    mainSegment: 2,
    doubleRing: 3,
    outerRing: 4
  };

  for (const segment of segments) {
    // Check each part of the segment
    if (segment.innerSegment.operation !== null) {
      activeSegments.push({
        segment,
        part: 'innerSegment',
        distanceFromCenter: distanceMap.innerSegment
      });
    }
    
    if (segment.tripleRing.operation !== null) {
      activeSegments.push({
        segment,
        part: 'tripleRing',
        distanceFromCenter: distanceMap.tripleRing
      });
    }
    
    if (segment.mainSegment.operation !== null) {
      activeSegments.push({
        segment,
        part: 'mainSegment',
        distanceFromCenter: distanceMap.mainSegment
      });
    }
    
    if (segment.doubleRing.operation !== null) {
      activeSegments.push({
        segment,
        part: 'doubleRing',
        distanceFromCenter: distanceMap.doubleRing
      });
    }
    
    if (segment.outerRing.operation !== null) {
      activeSegments.push({
        segment,
        part: 'outerRing',
        distanceFromCenter: distanceMap.outerRing
      });
    }
  }

  // Sort by distance from center (ascending)
  return activeSegments.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
};

/**
 * Create a map of number modifiers from all segments
 */
export const createNumberModifiersMap = (segments: DartBoardSegment[]): Map<number, OuterRingState> => {
  const numberModifiers = new Map<number, OuterRingState>();
  
  for (const segment of segments) {
    // Only add the number to the modifier map if it has a non-normal outer ring state
    if (segment.outerRing.outerRingState !== 'normal') {
      numberModifiers.set(segment.number, segment.outerRing.outerRingState);
    }
  }
  
  return numberModifiers;
};

/**
 * Create a map of repeat operations for each segment number
 */
export const createRepeatOperationsMap = (segments: DartBoardSegment[]): Map<number, number> => {
  const repeatOperations = new Map<number, number>();
  
  for (const segment of segments) {
    // Check if the segment has a repeat operation in the outer ring
    if (segment.outerRing.outerRingState === 'twoDots' || 
        segment.outerRing.outerRingState === 'threeDots' || 
        segment.outerRing.outerRingState === 'fourDots') {
      
      // Determine the repeat count
      let repeatCount = 1;
      switch (segment.outerRing.outerRingState) {
        case 'twoDots':
          repeatCount = 2;
          break;
        case 'threeDots':
          repeatCount = 3;
          break;
        case 'fourDots':
          repeatCount = 4;
          break;
      }
      
      // Add to the map
      repeatOperations.set(segment.number, repeatCount);
    }
  }
  
  return repeatOperations;
};

/**
 * Modify a number based on its outer ring state
 */
export const applyNumberModifier = (
  number: number, 
  outerRingState: OuterRingState | undefined
): { modifiedNumber: number, skipOperation: boolean, modifierText: string, repeatOperation: number } => {
  let modifiedNumber = number;
  let skipOperation = false;
  let modifierText = '';
  let repeatOperation = 1; // Default is to perform operation once
  
  if (outerRingState) {
    switch (outerRingState) {
      case 'cross':
        skipOperation = true;
        modifierText = ' (ignored)';
        break;
      case 'diagonalLine':
        modifiedNumber = number / 2;
        modifierText = ` (${number}÷2=${formatNumber(modifiedNumber)})`;
        break;
      case 'twoDots':
        repeatOperation = 2;
        modifierText = ` (repeat operation 2 times)`;
        break;
      case 'threeDots':
        repeatOperation = 3;
        modifierText = ` (repeat operation 3 times)`;
        break;
      case 'fourDots':
        repeatOperation = 4;
        modifierText = ` (repeat operation 4 times)`;
        break;
      case 'square':
        modifiedNumber = Math.pow(number, 2);
        modifierText = ` (${number}²=${formatNumber(modifiedNumber)})`;
        break;
      case 'twoSquares':
        modifiedNumber = Math.pow(number, 4);
        modifierText = ` (${number}⁴=${formatNumber(modifiedNumber)})`;
        break;
      case 'diamond':
        modifiedNumber = parseInt(Math.abs(number).toString().split('').reverse().join('')) * Math.sign(number);
        modifierText = ` (reversed=${formatNumber(modifiedNumber)})`;
        break;
      case 'singleWavy':
        modifiedNumber = Math.round(number);
        modifierText = ` (rounded to ${formatNumber(modifiedNumber)})`;
        break;
      case 'doubleWavy':
        modifiedNumber = Math.round(number / 10) * 10;
        modifierText = ` (rounded to ${formatNumber(modifiedNumber)})`;
        break;
      case 'tripleWavy':
        modifiedNumber = Math.round(number / 100) * 100;
        modifierText = ` (rounded to ${formatNumber(modifiedNumber)})`;
        break;
      case 'oneThirdFull':
        // Use fraction.js for exact division by 3
        modifiedNumber = new Fraction(number).div(3).valueOf();
        modifierText = ` (${number}÷3=${formatNumber(modifiedNumber)})`;
        break;
      default:
        break;
    }
  }
  
  return { modifiedNumber, skipOperation, modifierText, repeatOperation };
};

/**
 * Calculate the equation result based on active segments
 * 
 * This function processes segments in a specific order:
 * 1. Segments are processed ring by ring from innermost to outermost
 * 2. After processing each ring, if any segment in that ring matches the bullseye color,
 *    the bullseye actions (inner and outer) are applied
 * 3. Segments with "subtraction" operations (yellow) have their values negated
 * 4. Partial segments (1/3 shaded) use 1/3 of their number value
 * 5. Outer ring modifiers like "oneThirdFull" are applied to the number before operations
 */
export const calculateEquation = (segments: DartBoardSegment[], bullseye: BullseyeState): {
  steps: string[],
  result: number
} => {
  // Find active segments and sort them from inside out
  const activeSegments = findActiveSegments(segments);
  
  if (activeSegments.length === 0) {
    return { steps: [], result: 0 };
  }
  
  // Create a map of number modifiers
  const numberModifiers = createNumberModifiersMap(segments);
  
  // Create a map of repeat operations
  const repeatOperations = createRepeatOperationsMap(segments);
  
  // Steps for showing the calculation process
  const steps: string[] = [];
  
  // Map bullseye color to matching operation
  let matchingOperation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null = null;
  if (bullseye.color) {
    switch (bullseye.color) {
      case 'blue':
        matchingOperation = 'addition';
        break;
      case 'yellow':
        matchingOperation = 'subtraction';
        break;
      case 'pink':
        matchingOperation = 'multiplication';
        break;
      case 'purple':
        matchingOperation = 'division';
        break;
    }
  }
  
  // Group segments by their ring (distance from center)
  const segmentsByRing: Map<number, Array<{
    segment: DartBoardSegment,
    part: 'innerSegment' | 'tripleRing' | 'mainSegment' | 'doubleRing' | 'outerRing',
    distanceFromCenter: number
  }>> = new Map();
  
  // Group all segments by their ring
  for (const segmentData of activeSegments) {
    const { distanceFromCenter } = segmentData;
    
    if (!segmentsByRing.has(distanceFromCenter)) {
      segmentsByRing.set(distanceFromCenter, []);
    }
    
    segmentsByRing.get(distanceFromCenter)?.push(segmentData);
  }
  
  // Sort rings by distance from center
  const ringDistances = Array.from(segmentsByRing.keys()).sort((a, b) => a - b);
  
  // Helper function to apply a bullseye action with proper handling for repeating operations
  const applyBullseyeActionWithSteps = (
    currentResult: number, 
    bullseyeAction: BullseyeActionType | null, 
    steps: string[],
    lastOperation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null = null,
    lastOperand: number | null = null
  ): { result: number, updatedSteps: string[] } => {
    if (!bullseyeAction) {
      return { result: currentResult, updatedSteps: steps };
    }
    
    const actionText = getBullseyeActionText(bullseyeAction);
    const newSteps = [...steps];
    let newResult = currentResult;
    
    // Handle repeat operations (twoDots, threeDots, fourDots)
    if (bullseyeAction === 'twoDots' || bullseyeAction === 'threeDots' || bullseyeAction === 'fourDots') {
      // Determine how many times to repeat the operation
      let repeatCount = 1;
      switch (bullseyeAction) {
        case 'twoDots':
          repeatCount = 2;
          break;
        case 'threeDots':
          repeatCount = 3;
          break;
        case 'fourDots':
          repeatCount = 4;
          break;
      }
      
      // Check if we have the last operation and operand
      if (lastOperation && lastOperand !== null) {
        const operationText = getOperationText(lastOperation);
        
        // Apply the operation additional times
        newSteps.push(`${actionText}: Repeating last operation ${repeatCount - 1} more times`);
        
        for (let i = 1; i < repeatCount; i++) {
          const prevResult = newResult;
          
          // Apply the operation
          newResult = applyOperation(prevResult, lastOperand, lastOperation);
          
          newSteps.push(`  Repeat ${i+1}/${repeatCount}: ${formatNumber(prevResult)} ${operationText} ${lastOperand} = ${formatNumber(newResult)}`);
        }
      } else {
        // If we don't have the last operation info, note that we can't repeat
        newSteps.push(`${actionText}: Could not repeat operation (no previous operation found)`);
      }
    } else {
      // Apply regular bullseye action
      const prevVal = newResult;
      newResult = applyBullseyeAction(newResult, bullseyeAction);
      newSteps.push(`${actionText}(${formatNumber(prevVal)}) = ${formatNumber(newResult)}`);
    }
    
    return { result: newResult, updatedSteps: newSteps };
  };

  /**
   * Process a segment and apply its operation to the running result
   * 
   * @param segment - The dartboard segment
   * @param part - The specific part of the segment (innerSegment, tripleRing, etc.)
   * @param result - The current running result
   * @param isFirstSegment - Whether this is the first segment being processed
   * @returns Object containing the updated result and a step description
   */
  const processSegment = (
    segment: DartBoardSegment,
    part: 'innerSegment' | 'tripleRing' | 'mainSegment' | 'doubleRing' | 'outerRing',
    result: number,
    isFirstSegment: boolean
  ): { result: number, step: string } => {
    const operation = segment[part].operation;
    const number = segment.number;
    const isPartial = segment[part].isPartial || false;
    
    // Apply partial (1/3) calculation if needed
    let adjustedNumber = number;
    let partialText = '';
    if (isPartial) {
      // Use fraction.js for exact division by 3
      const frac = new Fraction(number).div(3);
      adjustedNumber = frac.valueOf();
      // Display as exact fraction for clarity
      partialText = ` (${number}÷3=${frac.toFraction()})`;
    }
    
    // Check for number modifiers from outer ring
    const outerRingState = numberModifiers.get(number);
    const { 
      modifiedNumber, 
      skipOperation, 
      modifierText
    } = applyNumberModifier(adjustedNumber, outerRingState);
    
    // Get the repeat operation from the map (this applies to all parts of the segment)
    const repeatOperation = repeatOperations.get(number) || 1;
    
    // Skip this operation if the number should be ignored
    if (skipOperation) {
      return { 
        result, 
        step: `${number}${partialText}${modifierText} (operation skipped)` 
      };
    }
    
    // Format the number display with modifiers
    const formattedValue = `${number}${partialText}${modifierText}`;
    
    // For the first segment, we just use its value (with adjustments)
    if (isFirstSegment) {
      // If it's subtraction, make the value negative
      let newResult = operation === 'subtraction' ? -modifiedNumber : modifiedNumber;
      
      let stepText = `Starting with: ${formattedValue}`;
      if (operation === 'subtraction') {
        stepText += ` (yellow segment, making it negative: ${formatNumber(newResult)})`;
      }
      
      return { result: newResult, step: stepText };
    } 
    // For subsequent segments, apply the operation to the running result
    else {
      const prevResult = result;
      const operationText = getOperationText(operation);
      
      // Apply the operation (once initially)
      let newResult = applyOperation(prevResult, modifiedNumber, operation);
      let stepText = `${formatNumber(prevResult)} ${operationText} ${formattedValue} = ${formatNumber(newResult)}`;
      
      // If we need to repeat the operation (for twoDots, threeDots, fourDots)
      if (repeatOperation > 1) {
        // Apply the operation additional times
        for (let i = 1; i < repeatOperation; i++) {
          const intermediateResult = newResult;
          newResult = applyOperation(intermediateResult, modifiedNumber, operation);
          stepText += `\n  Repeat ${i+1}/${repeatOperation}: ${formatNumber(intermediateResult)} ${operationText} ${number} = ${formatNumber(newResult)}`;
        }
      }
      
      return { 
        result: newResult, 
        step: stepText 
      };
    }
  };
  
  let result = 0;
  let firstSegmentProcessed = false;
  
  // Process each ring in order from innermost to outermost
  for (const ringDistance of ringDistances) {
    const ringSegments = segmentsByRing.get(ringDistance) || [];
    let hasMatchingOperationInRing = false;
    
    // Process each segment in the current ring
    for (const { segment, part } of ringSegments) {
      // Check if this segment's operation matches the bullseye color
      if (segment[part].operation === matchingOperation) {
        hasMatchingOperationInRing = true;
      }
      
      // Process the segment
      const { result: newResult, step } = processSegment(
        segment, 
        part, 
        result, 
        !firstSegmentProcessed
      );
      
      // Update the running result and steps
      result = newResult;
      steps.push(step);
      
      // Mark that we've processed the first segment
      firstSegmentProcessed = true;
    }
    
    // Apply bullseye actions after processing this ring if it contained matching operations
    if (hasMatchingOperationInRing && bullseye.color) {
      // Track the last operation and operand for repeating
      let lastOperation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null = null;
      let lastOperand: number | null = null;
      
      // Find the last segment with the matching operation
      for (const { segment, part } of ringSegments) {
        if (segment[part].operation === matchingOperation) {
          lastOperation = segment[part].operation;
          lastOperand = segment.number;
          
          // Apply any modifiers to the operand
          const outerRingState = numberModifiers.get(lastOperand);
          if (outerRingState) {
            const { modifiedNumber } = applyNumberModifier(lastOperand, outerRingState);
            lastOperand = modifiedNumber;
          }
          
          // If the segment is partial, adjust the operand
          if (segment[part].isPartial) {
            lastOperand = new Fraction(lastOperand).div(3).valueOf();
          }
        }
      }
      
      // Apply inner action first (if exists)
      if (bullseye.innerAction) {
        const innerActionResult = applyBullseyeActionWithSteps(
          result,
          bullseye.innerAction,
          [],
          lastOperation,
          lastOperand
        );
        
        // Update result and add steps
        result = innerActionResult.result;
        innerActionResult.updatedSteps.forEach(step => steps.push(step));
      }
      
      // Then apply outer action (if exists)
      if (bullseye.outerAction) {
        const outerActionResult = applyBullseyeActionWithSteps(
          result,
          bullseye.outerAction,
          [],
          lastOperation,
          lastOperand
        );
        
        // Update result and add steps
        result = outerActionResult.result;
        outerActionResult.updatedSteps.forEach(step => steps.push(step));
      }
    }
  }
  
  return { steps, result };
};
