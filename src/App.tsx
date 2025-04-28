import { useState } from 'react';
import './App.css';
import DartBoard from './components/DartBoard/DartBoard';
import PuzzleSolver from './components/PuzzleSolver/PuzzleSolver';
import { DartBoardSegment, BullseyeState } from './types/DartBoard';
import ShareButton from './components/ShareButton/ShareButton';
import { initializeBullseyeState } from './utils/dartboardUtils';

function App() {
  // State for segments and bullseye - initially empty, will be populated by DartBoard
  const [segments, setSegments] = useState<DartBoardSegment[]>([]);
  const [bullseye, setBullseye] = useState<BullseyeState>(initializeBullseyeState());
  
  // Ring widths configuration
  const ringWidths = {
    outerRing: 10,     // 5% of radius for outer clickable ring
    numberRing: 30,   // 17% of radius for number ring
    doubleRing: 6,    // 6% of radius for double scoring
    mainSegment: 23,  // 23% of radius for main segment
    tripleRing: 6,    // 6% of radius for triple scoring
    innerSegment: 30, // 30% of radius for inner segment
    bullseye: 12,     // 12% of radius for bullseye
    bullseyeBorder: 10 // 10% of bullseye width is the border
  };

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <h1>The Blue Prince: Billiard Room Dartboard Puzzle Solver</h1>
          <p>An interactive tool to help you solve the mathematical dartboard puzzles in the Billiard Room of "The Blue Prince" video game</p>
        </header>
        
        <div className="main-content">
          <div className="dartboard-section">
            {/* DartBoard is the source of truth - it handles URL params internally */}
            <DartBoard 
              config={{ ringWidths }} 
              onSegmentsChange={setSegments} 
              onBullseyeChange={setBullseye}
              enableUrlSharing={true}
            />
          </div>
          
          <div className="puzzle-solver-section">
            <PuzzleSolver segments={segments} bullseye={bullseye} />
            <ShareButton segments={segments} bullseye={bullseye} />
          </div>
        </div>
        
        <div className="game-context">
            <p>In The Blue Prince, players encounter mathematical puzzles requiring precise operations with dart segments:</p>
            <ul className="context-highlights">
              <li><strong>Blue segments</strong> represent addition</li>
              <li><strong>Yellow segments</strong> represent subtraction</li>
              <li><strong>Pink segments</strong> represent multiplication</li>
              <li><strong>Purple segments</strong> represent division</li>
            </ul>
            <p>This tool follows the game's specific rules, calculating from inner rings outward, to help you find the correct solutions.</p>
        </div>
          
        <div className="instructions-container">
          <h2>The Blue Prince: Billiards Room Dartboard Puzzle Guide</h2>
          
          <div className="game-context">
            <p>This tool helps you solve the mathematical dartboard puzzles found in the Billiards Room of "The Blue Prince" video game. Understanding these puzzles is essential for progressing through this area of the game.</p>
          </div>
          
          <div className="instructions-grid">
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">1</span>
                <h3>Understanding the Dartboard:</h3>
              </div>
              <p>The dartboard consists of numbered segments, each divided into rings. Calculations always start from the center (0) and work outward.</p>
              <div className="operation-list">
                <div className="operation operation-blue">
                  <div className="color-indicator blue-bg"></div>
                  <span>Blue = Addition (+)</span>
                </div>
                <div className="operation operation-yellow">
                  <div className="color-indicator yellow-bg"></div>
                  <span>Yellow = Subtraction (-)</span>
                </div>
                <div className="operation operation-pink">
                  <div className="color-indicator pink-bg"></div>
                  <span>Pink = Multiplication (×)</span>
                </div>
                <div className="operation operation-purple">
                  <div className="color-indicator purple-bg"></div>
                  <span>Purple = Division (÷)</span>
                </div>
              </div>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">2</span>
                <h3>Order of Operations:</h3>
              </div>
              <p>The Blue Prince puzzles follow a specific calculation order:</p>
              <ol>
                <li>Start with 0 at the center</li>
                <li>Process inner ring segments first</li>
                <li>Apply operations for all segments in that ring</li>
                <li>Check if bullseye actions are triggered</li>
                <li>Move to the next ring outward</li>
                <li>Repeat until all active rings are processed</li>
              </ol>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">3</span>
                <h3>Clicking on Segments:</h3>
              </div>
              <ul>
                <li>Click on any segment ring to cycle through operations</li>
                <li>Click the outer ring to cycle through special modifiers</li>
                <li>Click the bullseye to set its color and special actions</li>
              </ul>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">4</span>
                <h3>Special Symbols and Their Effects:</h3>
              </div>
              <p>These symbols can appear in both the outer ring (modifying segments) and the bullseye (affecting the running total):</p>
              
              <div className="symbol-list">
                <div className="symbol-item">
                  <span className="symbol">✕</span>
                  <span><strong>Cross:</strong> When on outer ring - Ignore this segment's operations</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">/</span>
                  <span><strong>Diagonal Line:</strong> Divide by 2</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">••</span>
                  <span><strong>Two Dots:</strong> Multiply by 2 before operation (outer ring) or repeat operation with value multiplied by 2 (bullseye)</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">•••</span>
                  <span><strong>Three Dots:</strong> Multiply by 3 before operation/repeat</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">••••</span>
                  <span><strong>Four Dots:</strong> Multiply by 4 before operation/repeat</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">□</span>
                  <span><strong>Square:</strong> Square the number (n²)</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">□□</span>
                  <span><strong>Two Squares:</strong> Fourth power (n⁴)</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">◊</span>
                  <span><strong>Diamond:</strong> Reverse digits (e.g., 12.34 becomes 43.21)</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">≈</span>
                  <span><strong>Single Wave:</strong> Round to nearest 1</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">≈≈</span>
                  <span><strong>Double Wave:</strong> Round to nearest 10</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">≈≈≈</span>
                  <span><strong>Triple Wave:</strong> Round to nearest 100</span>
                </div>
                <div className="symbol-item">
                  <span className="symbol">⅓</span>
                  <span><strong>One-third Full:</strong> Divide by 3</span>
                </div>
              </div>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">5</span>
                <h3>Using Symbols:</h3>
              </div>
              <div className="usage-list">
                <div className="usage-item">
                  <h4>Outer Ring Modifiers:</h4>
                  <p>Applied to segment numbers <em>before</em> performing operations. Click the outer ring to cycle through modifiers.</p>
                </div>
                <div className="usage-item">
                  <h4>Bullseye Actions:</h4>
                  <p>Applied to the running total <em>after</em> processing a ring containing a matching colored operation. The bullseye has both inner and outer actions that can be set separately.</p>
                </div>
              </div>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">6</span>
                <h3>Bullseye Colors:</h3>
              </div>
              <div className="bullseye-colors">
                <p>The bullseye color determines which operations trigger special actions:</p>
                <div className="bullseye-color">
                  <div className="color-indicator blue-bg"></div>
                  <span>Blue: Addition operations trigger bullseye actions</span>
                </div>
                <div className="bullseye-color">
                  <div className="color-indicator yellow-bg"></div>
                  <span>Yellow: Subtraction operations trigger bullseye actions</span>
                </div>
                <div className="bullseye-color">
                  <div className="color-indicator pink-bg"></div>
                  <span>Pink: Multiplication operations trigger bullseye actions</span>
                </div>
                <div className="bullseye-color">
                  <div className="color-indicator purple-bg"></div>
                  <span>Purple: Division operations trigger bullseye actions</span>
                </div>
              </div>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">7</span>
                <h3>Advanced Features:</h3>
              </div>
              <ul>
                <li><strong>Partial Segments:</strong> Segments can be partially shaded, using only 1/3 of their value</li>
                <li><strong>Repeat Operations:</strong> Dot symbols multiply the operand before applying the operation</li>
                <li><strong>Inner & Outer Bullseye:</strong> The bullseye has inner and outer actions that activate separately</li>
                <li><strong>Share Button:</strong> Creates a URL to share your current dartboard configuration</li>
              </ul>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">8</span>
                <h3>Example Calculation from The Blue Prince:</h3>
              </div>
              <ol>
                <li>Start with 0</li>
                <li>Inner ring of segment 20 is blue (addition): 0 + 20 = 20</li>
                <li>Inner ring of segment 5 is yellow with "••" (two dots) modifier: 20 - (5×2) = 20 - 10 = 10</li>
                <li>If bullseye is yellow with "square" action: Subtraction triggers action, so 10² = 100</li>
                <li>Move to next ring and continue calculations outward</li>
              </ol>
            </div>
          </div>
          
          <div className="solver-tip">
            <p>This solver follows the exact same rules as those in The Blue Prince game, helping you work out the solutions to the billiards room's dartboard puzzles without trial and error.</p>
          </div>
        </div>

        <footer className="app-footer">
          <p className="attribution">
            Dart Board icon by Ed Piel from <a href="https://thenounproject.com/browse/icons/term/dart-board/" target="_blank" title="Dart Board Icons">Noun Project</a> (CC BY 3.0)
          </p>
          <p className="source-code">
            <a href="https://github.com/adamrb/blue-prince-dartboard-puzzle-solver/" target="_blank" title="Source Code">View source on GitHub</a>
          </p>
        </footer>

      </div>
    </>
  );
}

export default App;
