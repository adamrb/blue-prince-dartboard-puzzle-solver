import { useState, useEffect, useCallback } from 'react';
import { DartBoardSegment, DartBoardConfig, BullseyeState, OuterRingState } from '../../types/DartBoard';
import { 
  createSegmentPath, 
  calcNumberPosition, 
  initializeDartBoardSegments,
  getNextOperation,
  getNextOuterRingState,
  getOperationColor,
  initializeBullseyeState,
  getBullseyeActionSymbol,
  getSymbolScaling,
  calcX,
  calcY
} from '../../utils/dartboardUtils';
import styles from './DartBoard.module.css';
import BullseyeDialog from '../BullseyeDialog/BullseyeDialog';

interface DartBoardProps {
  config?: Partial<DartBoardConfig>;
  onSegmentsChange?: (segments: DartBoardSegment[]) => void;
  onBullseyeChange?: (bullseye: BullseyeState) => void;
}

const DEFAULT_CONFIG: DartBoardConfig = {
  // From the reference image, the numbers in clockwise order starting from top
  numberOrder: [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5],
  segmentCount: 20,
  boardRadius: 250, // Increased from 200 to make the dartboard larger
  // Default ring widths as percentages of the board radius
  ringWidths: {
    outerRing: 10,     // 10% of radius for outer clickable ring
    numberRing: 20,    // 20% of radius for number ring (wider for better readability)
    doubleRing: 6,     // 6% of radius for double scoring
    mainSegment: 15,   // 15% of radius for main segment
    tripleRing: 6,     // 6% of radius for triple scoring
    innerSegment: 23,  // 23% of radius for inner segment
    bullseye: 15,      // 15% of radius for bullseye (larger to be more visible)
    bullseyeBorder: 15 // 15% of bullseye width is the border (small border)
  }
};

const DartBoard: React.FC<DartBoardProps> = ({ config, onSegmentsChange, onBullseyeChange }) => {
  const boardConfig = { ...DEFAULT_CONFIG, ...config };
  const [segments, setSegments] = useState<DartBoardSegment[]>([]);
  const [bullseye, setBullseye] = useState(initializeBullseyeState());
  
  // Constants for SVG drawing
  const centerX = boardConfig.boardRadius;
  const centerY = boardConfig.boardRadius;
  const rotationOffset = -9; // 9 degrees clockwise rotation (half segment)
  
  // Extract ring width configuration
  const ringWidths = boardConfig.ringWidths || DEFAULT_CONFIG.ringWidths!;
  
  // Calculate total width percentage to ensure we don't exceed 100%
  const totalWidthPercentage = 
    (ringWidths.outerRing || 0) + 
    (ringWidths.numberRing || 0) + 
    (ringWidths.doubleRing || 0) + 
    (ringWidths.mainSegment || 0) + 
    (ringWidths.tripleRing || 0) + 
    (ringWidths.innerSegment || 0) + 
    (ringWidths.bullseye || 0);
    
  // If total percentage is greater than 90%, scale each component proportionally
  const scaleFactor = totalWidthPercentage > 90 ? 90 / totalWidthPercentage : 1;
    
  // Calculate all ring radii based on configurable widths (working from outside in)
  // Main dartboard boundary (90% of total boardRadius)
  const boardRadius = boardConfig.boardRadius * 0.9;
  
  // Start from the maximum radius and work inward
  let currentRadius = boardRadius;
  
  // Outermost functional ring
  const outerRingOuterRadius = currentRadius;
  const outerRingWidth = ((ringWidths.outerRing! / 100) * boardConfig.boardRadius) * scaleFactor;
  const outerRingInnerRadius = Math.max(currentRadius - outerRingWidth, 5);
  currentRadius = outerRingInnerRadius;
  
  // Number ring (non-clickable)
  const numberRingOuterRadius = currentRadius;
  const numberRingWidth = ((ringWidths.numberRing! / 100) * boardConfig.boardRadius) * scaleFactor;
  const numberRingInnerRadius = Math.max(currentRadius - numberRingWidth, 5);
  const numberRingRadius = (numberRingOuterRadius + numberRingInnerRadius) / 2; // Center for text
  currentRadius = numberRingInnerRadius;
  
  // Double ring (outer scoring ring)
  const doubleRingOuterRadius = currentRadius;
  const doubleRingWidth = ((ringWidths.doubleRing! / 100) * boardConfig.boardRadius) * scaleFactor;
  const doubleRingInnerRadius = Math.max(currentRadius - doubleRingWidth, 5);
  currentRadius = doubleRingInnerRadius;
  
  // Main segment area
  const mainSegmentOuterRadius = currentRadius;
  const mainSegmentWidth = ((ringWidths.mainSegment! / 100) * boardConfig.boardRadius) * scaleFactor;
  const mainSegmentInnerRadius = Math.max(currentRadius - mainSegmentWidth, 5);
  currentRadius = mainSegmentInnerRadius;
  
  // Triple ring (inner scoring ring)
  const tripleRingOuterRadius = currentRadius;
  const tripleRingWidth = ((ringWidths.tripleRing! / 100) * boardConfig.boardRadius) * scaleFactor;
  const tripleRingInnerRadius = Math.max(currentRadius - tripleRingWidth, 5);
  currentRadius = tripleRingInnerRadius;
  
  // Inner segment area
  const innerSegmentOuterRadius = currentRadius;
  const innerSegmentWidth = ((ringWidths.innerSegment! / 100) * boardConfig.boardRadius) * scaleFactor;
  const innerSegmentInnerRadius = Math.max(currentRadius - innerSegmentWidth, 5);
  currentRadius = innerSegmentInnerRadius;
  
  // Bullseye rings
  const bullseyeWidth = ((ringWidths.bullseye! / 100) * boardConfig.boardRadius) * scaleFactor;
  const bullseyeRadius = currentRadius; // Outer radius of bullseye
  
  // Calculate inner bullseye radius with border
  const bullseyeBorderPercentage = ringWidths.bullseyeBorder !== undefined ? ringWidths.bullseyeBorder / 100 : 0.15;
  const bullseyeBorderWidth = bullseyeWidth * bullseyeBorderPercentage;
  const innerBullseyeRadius = Math.max(bullseyeRadius - bullseyeBorderWidth, 5); // Only subtract the border width
  
  const svgSize = boardConfig.boardRadius * 2;

  // Initialize segments on component mount
  useEffect(() => {
    const initialSegments = initializeDartBoardSegments(boardConfig.numberOrder);
    setSegments(initialSegments);
    // Notify parent of initial state
    if (onSegmentsChange) {
      onSegmentsChange(initialSegments);
    }
  }, [boardConfig.numberOrder, onSegmentsChange]);

  // Handle segment part click - cycle through operations or outer ring states
  const handleSegmentPartClick = (id: number, part: 'outerRing' | 'doubleRing' | 'mainSegment' | 'tripleRing' | 'innerSegment') => {
    setSegments(prevSegments => {
      const updatedSegments = prevSegments.map(segment => {
        if (segment.id === id) {
          if (part === 'outerRing') {
            // For outer ring, we cycle through states instead of operations
            return {
              ...segment,
              outerRing: {
                ...segment.outerRing,
                outerRingState: getNextOuterRingState(segment.outerRing.outerRingState),
                operation: segment.outerRing.operation // Keep the current operation
              }
            };
          } else {
            // For other parts, cycle through operations as before
            return {
              ...segment,
              [part]: {
                ...segment[part],
                operation: getNextOperation(segment[part].operation)
              }
            };
          }
        }
        return segment;
      });
      
      // Notify parent component of the change
      if (onSegmentsChange) {
        onSegmentsChange(updatedSegments);
      }
      
      return updatedSegments;
    });
  };

  // State for bullseye dialog
  const [bullseyeDialogOpen, setBullseyeDialogOpen] = useState(false);
  
  // Handle bullseye click - open configuration dialog
  const handleBullseyeClick = () => {
    setBullseyeDialogOpen(true);
  };
  
  // Get operation class for bullseye
  const getBullseyeOperationClass = (part: 'outerBullseye' | 'innerBullseye') => {
    const operation = bullseye[part].operation;
    if (operation === 'addition') return styles.operationAddition;
    if (operation === 'subtraction') return styles.operationSubtraction;
    if (operation === 'multiplication') return styles.operationMultiplication;
    if (operation === 'division') return styles.operationDivision;
    return '';
  };

  // Calculate angle for each segment
  const segmentAngle = 360 / boardConfig.segmentCount;

  // Create divider lines between segments
  const renderSegmentDividers = () => {
    const dividers = [];
    for (let i = 0; i < boardConfig.segmentCount; i++) {
      const angle = i * segmentAngle + rotationOffset;
      const startX = centerX;
      const startY = centerY;
      const endX = centerX + boardRadius * Math.cos((angle - 90) * (Math.PI / 180));
      const endY = centerY + boardRadius * Math.sin((angle - 90) * (Math.PI / 180));
      
      dividers.push(
        <line
          key={`divider-${i}`}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          className={styles.segmentDivider}
        />
      );
    }
    return dividers;
  };

  // Create divider lines for outer ring
  const renderOuterRingDividers = () => {
    const dividers = [];
    for (let i = 0; i < boardConfig.segmentCount; i++) {
      const angle = i * segmentAngle + rotationOffset;
      const radians = (angle - 90) * (Math.PI / 180);
      
      // Calculate start and end points for the outer ring dividers
      const startX = centerX + outerRingInnerRadius * Math.cos(radians);
      const startY = centerY + outerRingInnerRadius * Math.sin(radians);
      const endX = centerX + outerRingOuterRadius * Math.cos(radians);
      const endY = centerY + outerRingOuterRadius * Math.sin(radians);
      
      dividers.push(
        <line
          key={`outer-divider-${i}`}
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          className={styles.outerRingDivider}
        />
      );
    }
    return dividers;
  };

  // Generate SVG paths for each segment
  const renderSegments = segments.map((segment, index) => {
    const startAngle = index * segmentAngle + rotationOffset;
    const endAngle = (index + 1) * segmentAngle + rotationOffset;
    
    // Create paths for each section of the segment
    const outerRingPath = createSegmentPath(
      centerX, 
      centerY, 
      outerRingInnerRadius, 
      outerRingOuterRadius, 
      startAngle, 
      endAngle
    );
    
    const doubleRingPath = createSegmentPath(
      centerX, 
      centerY, 
      doubleRingInnerRadius, 
      doubleRingOuterRadius, 
      startAngle, 
      endAngle
    );
    
    const mainSegmentPath = createSegmentPath(
      centerX, 
      centerY, 
      mainSegmentInnerRadius, 
      mainSegmentOuterRadius, 
      startAngle, 
      endAngle
    );
    
    const tripleRingPath = createSegmentPath(
      centerX, 
      centerY, 
      tripleRingInnerRadius, 
      tripleRingOuterRadius, 
      startAngle, 
      endAngle
    );
    
    const innerSegmentPath = createSegmentPath(
      centerX, 
      centerY, 
      innerSegmentInnerRadius, 
      innerSegmentOuterRadius, 
      startAngle, 
      endAngle
    );
    
    // Position for the number
    const numberPos = calcNumberPosition(
      centerX, 
      centerY, 
      numberRingRadius, 
      startAngle + segmentAngle / 2
    );

    // Alternate between black and white segments
    const isBlack = index % 2 === 0;
    const baseColor = isBlack ? styles.blackSegment : styles.whiteSegment;
    
    // Get operation classes for each segment part
    const getOperationClass = (part: 'outerRing' | 'doubleRing' | 'mainSegment' | 'tripleRing' | 'innerSegment') => {
      const operation = segment[part].operation;
      if (operation === 'addition') return styles.operationAddition;
      if (operation === 'subtraction') return styles.operationSubtraction;
      if (operation === 'multiplication') return styles.operationMultiplication;
      if (operation === 'division') return styles.operationDivision;
      return '';
    };

    // Get the symbol for the outer ring state
    const getOuterRingSymbol = () => {
      // Center position for the symbol
      const midAngle = startAngle + segmentAngle / 2;
      const symbolRadius = (outerRingInnerRadius + outerRingOuterRadius) / 2;
      const symbolX = calcX(centerX, symbolRadius, midAngle);
      const symbolY = calcY(centerY, symbolRadius, midAngle);
      
      switch (segment.outerRing.outerRingState) {
        case 'cross':
          // Cross symbol (X) - skip this step
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <line
                x1={-10}
                y1={-10}
                x2={10}
                y2={10}
                stroke="red"
                strokeWidth={2}
              />
              <line
                x1={10}
                y1={-10}
                x2={-10}
                y2={10}
                stroke="red"
                strokeWidth={2}
              />
            </g>
          );
        case 'diagonalLine':
          // Diagonal line (/) - slash final number in half
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <line
                x1={-10}
                y1={10}
                x2={10}
                y2={-10}
                stroke="red"
                strokeWidth={2}
              />
            </g>
          );
        case 'twoDots':
          // Two dots - repeat this step 2 times
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <circle
                cx={-5}
                cy={0}
                r={3}
                fill="red"
              />
              <circle
                cx={5}
                cy={0}
                r={3}
                fill="red"
              />
            </g>
          );
        case 'threeDots':
          // Three dots - repeat this step 3 times
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <circle
                cx={0}
                cy={-6}
                r={3}
                fill="red"
              />
              <circle
                cx={-5}
                cy={3}
                r={3}
                fill="red"
              />
              <circle
                cx={5}
                cy={3}
                r={3}
                fill="red"
              />
            </g>
          );
        case 'fourDots':
          // Four dots - repeat this step 4 times
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <circle
                cx={-5}
                cy={-5}
                r={3}
                fill="red"
              />
              <circle
                cx={5}
                cy={-5}
                r={3}
                fill="red"
              />
              <circle
                cx={-5}
                cy={5}
                r={3}
                fill="red"
              />
              <circle
                cx={5}
                cy={5}
                r={3}
                fill="red"
              />
            </g>
          );
        case 'square':
          // Square - n²
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '18px', fill: 'white' }}
              >
                □
              </text>
            </g>
          );
        case 'twoSquares':
          // Two squares - n⁴
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '18px', fill: 'white' }}
              >
                □□
              </text>
            </g>
          );
        case 'diamond':
          // Diamond - reverse numbers
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '18px', fill: 'white' }}
              >
                ◊
              </text>
            </g>
          );
        case 'singleWavy':
          // Single wavy - round to nearest 1
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '18px', fill: 'white' }}
              >
                ≈
              </text>
            </g>
          );
        case 'doubleWavy':
          // Double wavy - round to nearest 10
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '16px', fill: 'white' }}
              >
                ≈≈
              </text>
            </g>
          );
        case 'tripleWavy':
          // Triple wavy - round to nearest 100
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '14px', fill: 'white' }}
              >
                ≈≈≈
              </text>
            </g>
          );
        case 'oneThirdFull':
          // 1/3 full - divide by 3
          return (
            <g transform={`translate(${symbolX}, ${symbolY})`}>
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '18px', fill: 'white' }}
              >
                ⅓
              </text>
            </g>
          );
        default:
          return null;
      }
    };

    return (
      <g key={segment.id}>
        {/* Outer ring segment (beyond the numbers) */}
        <path
          d={outerRingPath}
          className={`${styles.segment} ${baseColor} ${getOperationClass('outerRing')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'outerRing')}
          aria-label={`Outer ring ${segment.number}`}
        />
        
        {/* Outer ring state symbol */}
        {segment.outerRing.outerRingState !== 'normal' && getOuterRingSymbol()}
        
        {/* Double ring (outer scoring ring) - alternating dark/light grey */}
        <path
          d={doubleRingPath}
          className={`${styles.segment} ${index % 2 === 0 ? styles.doubleRingDarkGrey : styles.doubleRingLightGrey} ${getOperationClass('doubleRing')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'doubleRing')}
          aria-label={`Double ${segment.number}`}
        />
        
        {/* Main segment area */}
        <path
          d={mainSegmentPath}
          className={`${styles.segment} ${baseColor} ${getOperationClass('mainSegment')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'mainSegment')}
          aria-label={`Segment ${segment.number} main area`}
        />
        
        {/* Triple ring (inner scoring ring) - alternating dark/light grey */}
        <path
          d={tripleRingPath}
          className={`${styles.segment} ${index % 2 === 0 ? styles.tripleRingDarkGrey : styles.tripleRingLightGrey} ${getOperationClass('tripleRing')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'tripleRing')}
          aria-label={`Triple ${segment.number}`}
        />
        
        {/* Inner segment area */}
        <path
          d={innerSegmentPath}
          className={`${styles.segment} ${baseColor} ${getOperationClass('innerSegment')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'innerSegment')}
          aria-label={`Segment ${segment.number} inner area`}
        />
        
        {/* Number (not clickable) */}
        <text
          x={numberPos.x}
          y={numberPos.y}
          className={styles.numberText}
          style={{ fontSize: '28px', fontWeight: 'bold' }}
        >
          {segment.number}
        </text>
      </g>
    );
  });

  // Reset function to return dartboard to initial state
  const resetDartboard = useCallback(() => {
    const initialSegments = initializeDartBoardSegments(boardConfig.numberOrder);
    setSegments(initialSegments);
    
    const initialBullseye = initializeBullseyeState();
    setBullseye(initialBullseye);
    
    // Notify parent components of the changes
    if (onSegmentsChange) {
      onSegmentsChange(initialSegments);
    }
    
    if (onBullseyeChange) {
      onBullseyeChange(initialBullseye);
    }
  }, [boardConfig.numberOrder, onSegmentsChange, onBullseyeChange]);

  return (
    <div className={styles.dartboardContainer}>
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        width={svgSize}
        height={svgSize}
        className={styles.dartboard}
      >
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={boardConfig.boardRadius}
          className={styles.boardBackground}
        />

        {/* Outer ring boundary */}
        <circle
          cx={centerX}
          cy={centerY}
          r={boardRadius}
          className={styles.outerRing}
        />
        
        {/* Number ring (non-clickable) - proper grey background for numbers */}
        <path 
          d={`M ${centerX},${centerY} m 0,${-numberRingOuterRadius} a ${numberRingOuterRadius},${numberRingOuterRadius} 0 1,0 0,${2*numberRingOuterRadius} a ${numberRingOuterRadius},${numberRingOuterRadius} 0 1,0 0,${-2*numberRingOuterRadius} Z
              M ${centerX},${centerY} m 0,${-numberRingInnerRadius} a ${numberRingInnerRadius},${numberRingInnerRadius} 0 1,0 0,${2*numberRingInnerRadius} a ${numberRingInnerRadius},${numberRingInnerRadius} 0 1,0 0,${-2*numberRingInnerRadius} Z`}
          className={styles.numberRing}
        />
        
        {/* Outer ring dividers - white lines on the outer ring */}
        {renderOuterRingDividers()}
        
        {/* Segment dividers - extending from center */}
        {renderSegmentDividers()}

        {/* Segments - all the clickable game pieces */}
        {renderSegments}

        {/* Outer Bullseye - non-clickable */}
        <circle
          cx={centerX}
          cy={centerY}
          r={bullseyeRadius}
          className={styles.bullseye}
        />

        {/* Outer Bullseye clickable */}
        <circle
          cx={centerX}
          cy={centerY}
          r={bullseyeRadius}
          className={`${styles.bullseye} ${styles.segment}`}
          onClick={handleBullseyeClick}
        />

        {/* Inner bullseye with color based on selection */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerBullseyeRadius}
          className={`${styles.innerBullseye} ${styles.segment} ${
            bullseye.color === 'blue' ? styles.operationAddition : 
            bullseye.color === 'yellow' ? styles.operationSubtraction :
            bullseye.color === 'pink' ? styles.operationMultiplication :
            bullseye.color === 'purple' ? styles.operationDivision : ''
          }`}
          onClick={handleBullseyeClick}
        />
        
        {/* Bullseye action symbols - using SVG viewBox for better scaling */}
        {bullseye.outerAction && (() => {
          const scaling = getSymbolScaling(bullseye.outerAction, false, innerBullseyeRadius);
          return (
            <svg
              x={centerX - scaling.width / 2}
              y={centerY - scaling.height / 2}
              width={scaling.width}
              height={scaling.height}
              viewBox="0 0 24 24"
              preserveAspectRatio="xMidYMid meet"
            >
              <text
                x="12"
                y="14"
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.bullseyeSymbol}
                style={{ fontSize: scaling.fontSize }}
                fill="white"
              >
                {getBullseyeActionSymbol(bullseye.outerAction)}
              </text>
            </svg>
          );
        })()}
        
        {bullseye.innerAction && (() => {
          const scaling = getSymbolScaling(bullseye.innerAction, true, innerBullseyeRadius);
          return (
            <svg
              x={centerX - scaling.width / 2}
              y={centerY - scaling.height / 2}
              width={scaling.width}
              height={scaling.height}
              viewBox="0 0 24 24"
              preserveAspectRatio="xMidYMid meet"
            >
              <text
                x="12"
                y="14"
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.bullseyeSymbol}
                style={{ fontSize: scaling.fontSize }}
                fill="white"
              >
                {getBullseyeActionSymbol(bullseye.innerAction)}
              </text>
            </svg>
          );
        })()}
      </svg>
      
      <button 
        className={styles.resetButton} 
        onClick={resetDartboard}
        aria-label="Reset dartboard"
      >
        Reset Dartboard
      </button>
      
      {/* Bullseye configuration dialog */}
      <BullseyeDialog
        isOpen={bullseyeDialogOpen}
        currentState={bullseye}
        onClose={() => setBullseyeDialogOpen(false)}
        onSave={(newBullseyeState) => {
          setBullseye(newBullseyeState);
          if (onBullseyeChange) {
            onBullseyeChange(newBullseyeState);
          }
        }}
      />
    </div>
  );
};

export default DartBoard;
