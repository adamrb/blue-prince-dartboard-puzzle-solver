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
          <h2>How to use:</h2>
          <div className="instructions-grid">
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">1</span>
                <h3>Click on dart segments to cycle through operations:</h3>
              </div>
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
                <h3>Click on the outer ring for special modifiers:</h3>
              </div>
              <div className="modifier-list">
                <div className="modifier">
                  <span className="modifier-symbol">✕</span>
                  <span>Cross: Ignore all operations for this number</span>
                </div>
                <div className="modifier">
                  <span className="modifier-symbol">/</span>
                  <span>Diagonal Line: Divide the number by 2</span>
                </div>
                <div className="modifier">
                  <span className="modifier-symbol">••</span>
                  <span>Two Red Dots: Double the number</span>
                </div>
              </div>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">3</span>
                <h3>Work from innermost ring outward</h3>
              </div>
              <p>Start with segments closest to the bullseye and move outward when calculating.</p>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">4</span>
                <h3>Click on the bullseye for special actions:</h3>
              </div>
              <div className="bullseye-actions">
                <div className="bullseye-action">
                  <span className="action-symbol">□</span>
                  <span>Square: Square the result</span>
                </div>
                <div className="bullseye-action">
                  <span className="action-symbol">◊</span>
                  <span>Diamond: Flip/reverse the digits</span>
                </div>
                <div className="bullseye-action">
                  <span className="action-symbol">≈</span>
                  <span>Single Wave: Round to nearest 1</span>
                </div>
                <div className="bullseye-action">
                  <span className="action-symbol">≈≈</span>
                  <span>Double Wave: Round to nearest 10</span>
                </div>
                <div className="bullseye-action">
                  <span className="action-symbol">≈≈≈</span>
                  <span>Triple Wave: Round to nearest 100</span>
                </div>
              </div>
            </div>
            
            <div className="instruction-card">
              <div className="instruction-header">
                <span className="step-number">5</span>
                <h3>Choose a bullseye color matching an operation</h3>
              </div>
              <p>The bullseye color should match a segment operation you've used</p>
            </div>
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
