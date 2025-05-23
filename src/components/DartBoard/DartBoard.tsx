import { useState, useEffect, useCallback } from 'react';
import { DartBoardSegment, DartBoardConfig, BullseyeState, DartBoardSegmentPart, OuterRingState } from '../../types/DartBoard';
import { 
  createSegmentPath, 
  calcNumberPosition, 
  initializeDartBoardSegments,
  getNextOuterRingState,
  initializeBullseyeState,
  getBullseyeActionSymbol,
  getSymbolScaling,
  calcX,
  calcY
} from '../../utils/dartboardUtils';
import { savePuzzle } from '../../utils/storageUtils';
import {
  getPuzzleFromUrl,
  updateBrowserUrl,
  clearUrlParameters
} from '../../utils/urlUtils';
import styles from './DartBoard.module.css';
import BullseyeDialog from '../BullseyeDialog/BullseyeDialog';
import SegmentDialog from '../SegmentDialog/SegmentDialog';
import OuterSegmentDialog from '../OuterSegmentDialog/OuterSegmentDialog';
import HistoryBrowser from '../HistoryBrowser/HistoryBrowser';

interface DartBoardProps {
  config?: Partial<DartBoardConfig>;
  onSegmentsChange?: (segments: DartBoardSegment[]) => void;
  onBullseyeChange?: (bullseye: BullseyeState) => void;
  readOnly?: boolean; // When true, disables all interactions and is suitable for thumbnail display
  size?: number; // Optional size override for the dartboard (in pixels)
  segments?: DartBoardSegment[]; // Initial segments (optional)
  bullseye?: BullseyeState; // Initial bullseye state (optional)
  enableUrlSharing?: boolean; // When true, updates URL and reads from URL params
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

const DartBoard: React.FC<DartBoardProps> = ({ 
  config, 
  onSegmentsChange, 
  onBullseyeChange, 
  readOnly = false,
  size,
  segments: initialSegments, 
  bullseye: initialBullseye,
  enableUrlSharing = false
}) => {
  const boardConfig = { ...DEFAULT_CONFIG, ...config };
  const [segments, setSegments] = useState<DartBoardSegment[]>(initialSegments || []);
  const [bullseye, setBullseye] = useState<BullseyeState>(initialBullseye || initializeBullseyeState());
  
  // State for dialogs
  const [bullseyeDialogOpen, setBullseyeDialogOpen] = useState(false);
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [outerSegmentDialogOpen, setOuterSegmentDialogOpen] = useState(false);
  const [historyBrowserOpen, setHistoryBrowserOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<{
    id: number;
    part: 'innerSegment' | 'tripleRing' | 'mainSegment' | 'doubleRing' | 'outerRing';
    number: number;
  } | null>(null);
  
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
    // If URL sharing is enabled, try to load from URL first
    if (enableUrlSharing) {
      console.log('🔍 DartBoard - Checking URL for puzzle parameters');
      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.has('s') || urlParams.has('b')) {
        const puzzleFromUrl = getPuzzleFromUrl(boardConfig.numberOrder);
        
        if (puzzleFromUrl) {
          console.log('✅ DartBoard - Found puzzle in URL, loading state');
          setSegments(puzzleFromUrl.segments);
          setBullseye(puzzleFromUrl.bullseye);
          
          // Notify parent component of the loaded state
          if (onSegmentsChange) onSegmentsChange(puzzleFromUrl.segments);
          if (onBullseyeChange) onBullseyeChange(puzzleFromUrl.bullseye);
          return;
        }
      }
    }
    
    // Otherwise initialize from props or default if needed
    if (segments.length === 0) {
      const newSegments = initializeDartBoardSegments(boardConfig.numberOrder);
      setSegments(newSegments);
      
      // Notify parent of initial state
      if (onSegmentsChange) {
        onSegmentsChange(newSegments);
      }
    }
  }, [boardConfig.numberOrder, enableUrlSharing, onSegmentsChange, onBullseyeChange, segments.length]);

  // Update URL when state changes, if URL sharing is enabled
  useEffect(() => {
    if (enableUrlSharing && segments.length > 0) {
      updateBrowserUrl(segments, bullseye);
    }
  }, [segments, bullseye, enableUrlSharing]);

  // Sync internal segments state with prop changes
  useEffect(() => {
    if (initialSegments && initialSegments.length > 0) {
      // Only update if the state would actually change
      if (JSON.stringify(initialSegments) !== JSON.stringify(segments)) {
        console.log('📊 DartBoard - Updating segments from props');
        setSegments(initialSegments);
      }
    }
  }, [initialSegments]);
  
  // Sync internal bullseye state with prop changes (for URL loading)
  useEffect(() => {
    if (initialBullseye) {
      // Only update if the state would actually change
      if (JSON.stringify(initialBullseye) !== JSON.stringify(bullseye)) {
        console.log('🎯 DartBoard - Updating bullseye from props');
        setBullseye(initialBullseye);
      }
    }
  }, [initialBullseye]);

  // Handle bullseye click - open configuration dialog
  const handleBullseyeClick = () => {
    if (readOnly) return; // Don't open dialog in readOnly mode
    setBullseyeDialogOpen(true);
  };

  // Handle segment part click - open appropriate dialog based on segment part
  const handleSegmentPartClick = (id: number, part: 'outerRing' | 'doubleRing' | 'mainSegment' | 'tripleRing' | 'innerSegment') => {
    if (readOnly) return; // Don't handle clicks in readOnly mode
    
    const segment = segments.find(s => s.id === id);
    if (segment) {
      setSelectedSegment({ id, part, number: segment.number });
      
      // Use OuterSegmentDialog for outer ring, and regular SegmentDialog for other parts
      if (part === 'outerRing') {
        setOuterSegmentDialogOpen(true);
      } else {
        setSegmentDialogOpen(true);
      }
    }
  };

  // Handle segment dialog save
  const handleSegmentDialogSave = (updatedState: DartBoardSegmentPart) => {
    if (!selectedSegment) return;
    
    setSegments(prevSegments => {
      const updatedSegments = prevSegments.map(segment => {
        if (segment.id === selectedSegment.id) {
          return {
            ...segment,
            [selectedSegment.part]: {
              ...segment[selectedSegment.part],
              operation: updatedState.operation,
              isPartial: updatedState.isPartial,
              // For outer ring, we need to preserve the outer ring state
              ...(selectedSegment.part === 'outerRing' ? { outerRingState: segment.outerRing.outerRingState } : {})
            }
          };
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
  
  // Handle outer segment dialog save
  const handleOuterSegmentDialogSave = (updatedState: DartBoardSegmentPart & { outerRingState: OuterRingState }) => {
    if (!selectedSegment) return;
    
    setSegments(prevSegments => {
      const updatedSegments = prevSegments.map(segment => {
        if (segment.id === selectedSegment.id) {
          return {
            ...segment,
            outerRing: {
              operation: updatedState.operation,
              isPartial: updatedState.isPartial,
              outerRingState: updatedState.outerRingState
            }
          };
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

  // Handle outer ring state change
  const handleOuterRingStateChange = (id: number) => {
    if (readOnly) return; // Don't handle state changes in readOnly mode
    setSegments(prevSegments => {
      const updatedSegments = prevSegments.map(segment => {
        if (segment.id === id) {
          return {
            ...segment,
            outerRing: {
              ...segment.outerRing,
              outerRingState: getNextOuterRingState(segment.outerRing.outerRingState)
            }
          };
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
                style={{ fontSize: '18px', fill: 'red', fontWeight: 'bold' }}
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
                style={{ fontSize: '18px', fill: 'red', fontWeight: 'bold' }}
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
                style={{ fontSize: '18px', fill: 'red', fontWeight: 'bold' }}
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
                style={{ fontSize: '18px', fill: 'red', fontWeight: 'bold' }}
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
                style={{ fontSize: '16px', fill: 'red', fontWeight: 'bold' }}
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
                style={{ fontSize: '14px', fill: 'red', fontWeight: 'bold' }}
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
                style={{ fontSize: '18px', fill: 'red', fontWeight: 'bold' }}
              >
                ⅓
              </text>
            </g>
          );
        default:
          return null;
      }
    };

    // Create partial masks for 1/3 coloring
    const createPartialMaskId = (segmentId: number, partType: string) => `mask-${segmentId}-${partType}`;

    // Render masks for all segment parts
    const renderPartialMasks = () => {
      return (
        <defs>
          {/* Inner Segment Mask - middle third */}
          <mask id={createPartialMaskId(segment.id, 'innerSegment')}>
            <rect x={0} y={0} width={svgSize} height={svgSize} fill="black" />
            <path 
              d={createSegmentPath(
                centerX, 
                centerY, 
                innerSegmentInnerRadius, 
                innerSegmentOuterRadius, 
                startAngle + segmentAngle/3, // Start at 1/3 of the way through
                startAngle + (2*segmentAngle/3) // End at 2/3 of the way through (middle third)
              )}
              fill="white" 
            />
          </mask>

          {/* Triple Ring Mask - middle third */}
          <mask id={createPartialMaskId(segment.id, 'tripleRing')}>
            <rect x={0} y={0} width={svgSize} height={svgSize} fill="black" />
            <path 
              d={createSegmentPath(
                centerX, 
                centerY, 
                tripleRingInnerRadius, 
                tripleRingOuterRadius, 
                startAngle + segmentAngle/3,
                startAngle + (2*segmentAngle/3)
              )}
              fill="white" 
            />
          </mask>

          {/* Main Segment Mask - middle third */}
          <mask id={createPartialMaskId(segment.id, 'mainSegment')}>
            <rect x={0} y={0} width={svgSize} height={svgSize} fill="black" />
            <path 
              d={createSegmentPath(
                centerX, 
                centerY, 
                mainSegmentInnerRadius, 
                mainSegmentOuterRadius, 
                startAngle + segmentAngle/3,
                startAngle + (2*segmentAngle/3)
              )}
              fill="white" 
            />
          </mask>

          {/* Double Ring Mask - middle third */}
          <mask id={createPartialMaskId(segment.id, 'doubleRing')}>
            <rect x={0} y={0} width={svgSize} height={svgSize} fill="black" />
            <path 
              d={createSegmentPath(
                centerX, 
                centerY, 
                doubleRingInnerRadius, 
                doubleRingOuterRadius, 
                startAngle + segmentAngle/3,
                startAngle + (2*segmentAngle/3)
              )}
              fill="white" 
            />
          </mask>

          {/* Outer Ring Mask - middle third */}
          <mask id={createPartialMaskId(segment.id, 'outerRing')}>
            <rect x={0} y={0} width={svgSize} height={svgSize} fill="black" />
            <path 
              d={createSegmentPath(
                centerX, 
                centerY, 
                outerRingInnerRadius, 
                outerRingOuterRadius, 
                startAngle + segmentAngle/3,
                startAngle + (2*segmentAngle/3)
              )}
              fill="white" 
            />
          </mask>
        </defs>
      );
    };

    return (
      <g key={segment.id}>
        {/* SVG Masks for partial segments */}
        {renderPartialMasks()}
        
        {/* Outer ring segment (beyond the numbers) */}
        <path
          d={outerRingPath}
          className={`${styles.segment} ${baseColor} ${getOperationClass('outerRing')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'outerRing')}
          mask={segment.outerRing.isPartial ? `url(#${createPartialMaskId(segment.id, 'outerRing')})` : undefined}
          aria-label={`Outer ring ${segment.number}`}
        />
        
        {/* Right-click on outer ring changes state */}
        <path
          d={outerRingPath}
          className={`${styles.segment} ${styles.invisibleSegment}`}
          onClick={() => handleSegmentPartClick(segment.id, 'outerRing')}
          onContextMenu={(e) => {
            e.preventDefault();
            handleOuterRingStateChange(segment.id);
          }}
        />
        
        {/* Outer ring state symbol */}
        {segment.outerRing.outerRingState !== 'normal' && getOuterRingSymbol()}
        
        {/* Double ring (outer scoring ring) - alternating dark/light grey */}
        <path
          d={doubleRingPath}
          className={`${styles.segment} ${index % 2 === 0 ? styles.doubleRingDarkGrey : styles.doubleRingLightGrey} ${getOperationClass('doubleRing')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'doubleRing')}
          mask={segment.doubleRing.isPartial ? `url(#${createPartialMaskId(segment.id, 'doubleRing')})` : undefined}
          aria-label={`Double ${segment.number}`}
        />
        
        {/* Main segment area */}
        <path
          d={mainSegmentPath}
          className={`${styles.segment} ${baseColor} ${getOperationClass('mainSegment')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'mainSegment')}
          mask={segment.mainSegment.isPartial ? `url(#${createPartialMaskId(segment.id, 'mainSegment')})` : undefined}
          aria-label={`Segment ${segment.number} main area`}
        />
        
        {/* Triple ring (inner scoring ring) - alternating dark/light grey */}
        <path
          d={tripleRingPath}
          className={`${styles.segment} ${index % 2 === 0 ? styles.tripleRingDarkGrey : styles.tripleRingLightGrey} ${getOperationClass('tripleRing')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'tripleRing')}
          mask={segment.tripleRing.isPartial ? `url(#${createPartialMaskId(segment.id, 'tripleRing')})` : undefined}
          aria-label={`Triple ${segment.number}`}
        />
        
        {/* Inner segment area */}
        <path
          d={innerSegmentPath}
          className={`${styles.segment} ${baseColor} ${getOperationClass('innerSegment')}`}
          onClick={() => handleSegmentPartClick(segment.id, 'innerSegment')}
          mask={segment.innerSegment.isPartial ? `url(#${createPartialMaskId(segment.id, 'innerSegment')})` : undefined}
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
  // Automatically saves current state to history before resetting
  const resetDartboard = useCallback(() => {
    // Save current state to history before resetting
    savePuzzle(segments, bullseye);
    
    // Reset to initial state
    const initialSegments = initializeDartBoardSegments(boardConfig.numberOrder);
    setSegments(initialSegments);
    
    const initialBullseye = initializeBullseyeState();
    setBullseye(initialBullseye);
    
    // Clear URL parameters if URL sharing is enabled
    if (enableUrlSharing) {
      clearUrlParameters();
    }
    
    // Notify parent components of the changes
    if (onSegmentsChange) {
      onSegmentsChange(initialSegments);
    }
    
    if (onBullseyeChange) {
      onBullseyeChange(initialBullseye);
    }
  }, [boardConfig.numberOrder, enableUrlSharing, onSegmentsChange, onBullseyeChange, segments, bullseye]);
  
  // Handle loading a puzzle from history
  const handleLoadPuzzle = useCallback((savedSegments: DartBoardSegment[], savedBullseye: BullseyeState) => {
    setSegments(savedSegments);
    setBullseye(savedBullseye);
    
    // Notify parent components of the changes
    if (onSegmentsChange) {
      onSegmentsChange(savedSegments);
    }
    
    if (onBullseyeChange) {
      onBullseyeChange(savedBullseye);
    }
  }, [onSegmentsChange, onBullseyeChange]);

  return (
    <div className={styles.dartboardContainer}>
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        width={size || svgSize}
        height={size || svgSize}
        className={`${styles.dartboard} ${readOnly ? styles.readOnlyDartboard : ''}`}
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
      
      {/* Don't show buttons in readOnly mode */}
      {!readOnly && (
        <div className={styles.buttonContainer}>
          <button 
            className={styles.resetButton} 
            onClick={resetDartboard}
            aria-label="Reset dartboard"
          >
            Reset Dartboard
          </button>
          <button 
            className={styles.historyButton} 
            onClick={() => setHistoryBrowserOpen(true)}
            aria-label="Open puzzle history"
          >
            History
          </button>
        </div>
      )}
      
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
      
      {/* History browser dialog */}
      <HistoryBrowser
        isOpen={historyBrowserOpen}
        onClose={() => setHistoryBrowserOpen(false)}
        onLoadPuzzle={handleLoadPuzzle}
      />

      {/* Segment configuration dialog */}
      {selectedSegment && (
        <SegmentDialog
          isOpen={segmentDialogOpen}
          partType={selectedSegment.part}
          segmentNumber={selectedSegment.number}
          currentState={segments.find(s => s.id === selectedSegment.id)?.[selectedSegment.part] || { operation: null }}
          onClose={() => setSegmentDialogOpen(false)}
          onSave={handleSegmentDialogSave}
        />
      )}
      
      {/* Outer Segment configuration dialog */}
      {selectedSegment && selectedSegment.part === 'outerRing' && (
        <OuterSegmentDialog
          isOpen={outerSegmentDialogOpen}
          segmentNumber={selectedSegment.number}
          currentState={segments.find(s => s.id === selectedSegment.id)?.outerRing || { operation: null, outerRingState: 'normal' }}
          onClose={() => setOuterSegmentDialogOpen(false)}
          onSave={handleOuterSegmentDialogSave}
        />
      )}
    </div>
  );
};

export default DartBoard;
