import React from 'react';
import { DartBoardSegment, BullseyeState } from '../../types/DartBoard';
import { calculateEquation } from '../../utils/dartboardUtils';
import styles from './PuzzleSolver.module.css';

interface PuzzleSolverProps {
  segments: DartBoardSegment[];
  bullseye: BullseyeState;
}

const PuzzleSolver: React.FC<PuzzleSolverProps> = ({ segments, bullseye }) => {
  const { steps, result } = calculateEquation(segments, bullseye);

  if (steps.length === 0) {
    return (
      <div className={styles.puzzleSolver}>
        <p className={styles.instructions}>Click on dart board segments to create an equation.</p>
        <p className={styles.hint}>
          Remember:
          <span className={styles.blue}> Blue = Addition (+)</span>,
          <span className={styles.yellow}> Yellow = Subtraction (-)</span>,
          <span className={styles.pink}> Pink = Multiplication (×)</span>,
          <span className={styles.purple}> Purple = Division (÷)</span>
        </p>
        <p className={styles.hint}>Work from inside out (closest to bullseye moving outward).</p>
        <p className={styles.hint}>
          <strong>Special Rules:</strong><br />
          • <strong>Partial Segment (1/3 shaded):</strong> Use 1/3 of the number value<br />
          • <strong>Cross (✕):</strong> Ignore all operations for this number<br />
          • <strong>Diagonal Line (/):</strong> Divide the number by 2<br />
          • <strong>Two Red Dots (••):</strong> Repeat operation 2 times
        </p>
      </div>
    );
  }

  return (
    <div className={styles.puzzleSolver}>
      <div className={styles.equationContainer}>
        <h3>Equation:</h3>
        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              {index === 0 ? (
                <p>Starting with: <span className={styles.number}>{step}</span></p>
              ) : step.startsWith('  ') ? (
                <p className={styles.stepIndented}>{step}</p>
              ) : (
                <p>{step}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.resultContainer}>
        <h3>Result: <span className={styles.result}>{result}</span></h3>
      </div>
    </div>
  );
};

export default PuzzleSolver;
