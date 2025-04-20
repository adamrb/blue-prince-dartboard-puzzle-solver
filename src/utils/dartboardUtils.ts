import { DartBoardSegment, BullseyeState, BullseyeActionType, BullseyeColor, OuterRingState } from '../types/DartBoard';

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
      return value / 3;
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
 */
export const applyOperation = (
  a: number,
  b: number,
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null
): number => {

  // Apply the operation
  switch (operation) {
    case 'addition':
      return a + b;
    case 'subtraction':
      return a - b;
    case 'multiplication':
      return a * b;
    case 'division':
      return b !== 0 ? a / b : NaN; // Prevent division by zero
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
        modifierText = ` (${number}÷2=${modifiedNumber})`;
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
        modifierText = ` (${number}²=${modifiedNumber})`;
        break;
      case 'twoSquares':
        modifiedNumber = Math.pow(number, 4);
        modifierText = ` (${number}⁴=${modifiedNumber})`;
        break;
      case 'diamond':
        modifiedNumber = parseInt(Math.abs(number).toString().split('').reverse().join('')) * Math.sign(number);
        modifierText = ` (reversed=${modifiedNumber})`;
        break;
      case 'singleWavy':
        modifiedNumber = Math.round(number);
        modifierText = ` (rounded to ${modifiedNumber})`;
        break;
      case 'doubleWavy':
        modifiedNumber = Math.round(number / 10) * 10;
        modifierText = ` (rounded to ${modifiedNumber})`;
        break;
      case 'tripleWavy':
        modifiedNumber = Math.round(number / 100) * 100;
        modifierText = ` (rounded to ${modifiedNumber})`;
        break;
      case 'oneThirdFull':
        modifiedNumber = number / 3;
        modifierText = ` (${number}÷3=${modifiedNumber})`;
        break;
      default:
        break;
    }
  }
  
  return { modifiedNumber, skipOperation, modifierText, repeatOperation };
};

/**
 * Calculate the equation result based on active segments
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
  
  // Get the modifier for the first number (if any)
  const firstSegment = activeSegments[0].segment;
  const firstNumber = firstSegment.number;
  const firstNumberModifier = numberModifiers.get(firstNumber);
  
  // Apply modifier to first number if needed
  const { 
    modifiedNumber: modifiedFirstNumber, 
    modifierText: firstModifierText 
  } = applyNumberModifier(firstNumber, firstNumberModifier);
  
  // Check if the first segment has a yellow (subtraction) operation
  let result = modifiedFirstNumber;
  let firstStepText = `${firstNumber}${firstModifierText}`;
  
  const firstSegmentOperation = activeSegments[0].segment[activeSegments[0].part].operation;
  if (firstSegmentOperation === 'subtraction') {
    // If the first segment is yellow (subtraction), make the number negative
    result = -result;
    firstStepText = `${firstNumber}${firstModifierText} (yellow segment, making it negative: ${result})`;
  }
  
  // Start with the innermost segment's number (with modifier if applicable)
  const steps: string[] = [firstStepText];
  
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

  // Process each active segment in order from inside out
  for (let i = 1; i < activeSegments.length; i++) {
    const { segment, part } = activeSegments[i];
    const operation = segment[part].operation;
    const number = segment.number;
    
    // Check if this number has a modifier in the outer ring
    const outerRingState = numberModifiers.get(number);
    const { 
      modifiedNumber, 
      skipOperation, 
      modifierText,
      repeatOperation
    } = applyNumberModifier(number, outerRingState);
    
    // Skip this operation if the number should be ignored
    if (skipOperation) {
      steps.push(`${result} ${getOperationText(operation)} ${number}${modifierText} = ${result} (operation skipped)`);
      continue;
    }
    
    const operationText = getOperationText(operation);
    
    // Regular single operation first
    const prevResult = result;
    result = applyOperation(prevResult, modifiedNumber, operation);
    
    // Format the step
    steps.push(`${prevResult} ${operationText} ${number}${modifierText} = ${result}`);
    
    /**
     * Helper function to apply repeated operations with proper calculations based on the operation type
     */
    const applyRepeatedOperation = (
      baseValue: number, 
      operand: number, 
      operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null,
      repeats: number,
      steps: string[]
    ): { result: number, steps: string[] } => {
      if (repeats <= 1 || !operation) {
        return { result: baseValue, steps };
      }

      let result = baseValue;
      const operationText = getOperationText(operation);
      
      // The first operation was already applied, so we start from the second
      steps.push(`Repeat operation ${repeats - 1} more times:`);
      
      for (let i = 1; i < repeats; i++) {
        const currentResult = result;
        result = applyOperation(currentResult, operand, operation);
        steps.push(`  Step ${i + 1}: ${currentResult} ${operationText} ${operand} = ${result}`);
      }
      
      return { result, steps };
    };

    // Handle repeating operations (for red dots)
    if (repeatOperation > 1) {
      const repeatedOpResult = applyRepeatedOperation(
        result,
        modifiedNumber,
        operation,
        repeatOperation,
        [] // Create empty array to collect new steps
      );
      
      // Update the result
      result = repeatedOpResult.result;
      // Add the new steps to our existing steps array
      repeatedOpResult.steps.forEach(step => steps.push(step));
    }
    
    // Helper function to apply a bullseye action with proper handling for repeating operations
    const applyBullseyeActionWithSteps = (
      currentResult: number, 
      bullseyeAction: BullseyeActionType | null, 
      steps: string[],
      operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | null,
      operand: number
    ): { result: number, updatedSteps: string[] } => {
      if (!bullseyeAction) {
        return { result: currentResult, updatedSteps: steps };
      }
      
      const actionText = getBullseyeActionText(bullseyeAction);
      const newSteps = [...steps];
      let newResult = currentResult;
      
      // Check if this is a repeat operation action
      if (['twoDots', 'threeDots', 'fourDots'].includes(bullseyeAction)) {
        // Get the number of repeats
        let repeats = 1;
        if (bullseyeAction === 'twoDots') repeats = 2;
        if (bullseyeAction === 'threeDots') repeats = 3;
        if (bullseyeAction === 'fourDots') repeats = 4;
        
        // The operation is already performed once before we get here
        // So we need to perform it (repeats - 1) more times to reach the total
        
        // If repeats is 2, we need to do the operation one more time (2 total)
        const remainingRepeats = repeats - 1;
        
        if (remainingRepeats > 0) {
          // Apply the repeated operation
          newSteps.push(`${actionText}:`);
          
          // Apply the operation the remaining number of times
          for (let i = 0; i < remainingRepeats; i++) {
            const prevVal = newResult;
            newResult = applyOperation(newResult, operand, operation);
            // Step numbers still start at 1, but we're only showing the additional operations
            newSteps.push(`  Step ${i + 1}: ${prevVal} ${getOperationText(operation)} ${operand} = ${newResult}`);
          }
        } else {
          // If repeats is 1, we've already done it once, so just explain
          newSteps.push(`${actionText}: Operation already applied once, no additional repeats needed.`);
        }
      } else {
        // Apply regular bullseye action
        const prevVal = newResult;
        newResult = applyBullseyeAction(newResult, bullseyeAction);
        newSteps.push(`${actionText}(${prevVal}) = ${newResult}`);
      }
      
      return { result: newResult, updatedSteps: newSteps };
    };

    // Check if this operation matches the bullseye color and apply actions immediately if it does
    if (operation === matchingOperation) {
      // Apply inner action first (if exists)
      if (bullseye.innerAction) {
      const innerActionResult = applyBullseyeActionWithSteps(
        result, 
        bullseye.innerAction, 
        [], // Empty array for new steps
        operation,
        modifiedNumber
      );
      
      // Update result
      result = innerActionResult.result;
      // Add new steps to the existing steps array
      innerActionResult.updatedSteps.forEach(step => steps.push(step));
      }
      
      // Then apply outer action (if exists)
      if (bullseye.outerAction) {
        const outerActionResult = applyBullseyeActionWithSteps(
          result, 
          bullseye.outerAction, 
          [], // Empty array for new steps
          operation,
          modifiedNumber
        );
        
        // Update result
        result = outerActionResult.result;
        // Add new steps to the existing steps array
        outerActionResult.updatedSteps.forEach(step => steps.push(step));
      }
    }
  }
  
  return { steps, result };
};
