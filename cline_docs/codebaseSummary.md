# Codebase Summary

## Key Components and Their Interactions

### Components Structure
- **App**: The main application container for the Blue Prince dartboard puzzle solver
- **DartBoard**: Core SVG-based component rendering the interactive dart board matching the game's design
  - **DartBoardSegment**: Individual segments of the dart board (clickable) that represent operations
  - **DartBoardNumbers**: Text elements displaying numbers 1-20 around the board
- **PuzzleSolver**: Component that handles and displays dart board puzzle calculations following game rules
- **BullseyeDialog**: Component for managing advanced puzzle mechanics with special symbols

### Component Interactions
- App contains and manages the DartBoard and PuzzleSolver components
- App maintains state for colored segments (representing operations) and bullseye modifiers
- DartBoard handles user interactions and notifies App of changes via callbacks
- PuzzleSolver receives segment data and calculates the mathematical equations using game rules
- Mathematical operations: Blue=Addition, Yellow=Subtraction, Pink=Multiplication, Purple=Division

## Data Flow
- User interactions (clicks) on dart board segments trigger state changes in App
- State changes in the DartBoard component update the visual appearance of segments with colors
- PuzzleSolver component receives updated state and recalculates equations
- Mathematical operations are applied in order from inside rings to outside rings (game-specific)
- Equations and results are displayed to the user in a step-by-step format

## External Dependencies
- **React**: UI rendering and component architecture
- **TypeScript**: Static typing
- **Vite**: Build tool and development server
- No additional third-party libraries are being used

## Recent Significant Changes
- Initial project setup with Vite and React
- Implementation of interactive dart board with SVG
- Addition of puzzle-solving logic with mathematical operations from The Blue Prince game
- Display of equations and results with the PuzzleSolver component
- SEO optimization of documentation targeting The Blue Prince game terms
- README updates with detailed game puzzle mechanics and references

## User Feedback Integration
- No user feedback integrated yet since this is the initial implementation
- Future iterations will incorporate feedback on visual appearance and interaction

## Project Structure
```
blue-prince-dartboard-puzzle-solver/
├── cline_docs/         # Project documentation
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── DartBoard/  # Dart board related components
│   │   ├── BullseyeDialog/ # Components for bullseye symbols
│   │   └── PuzzleSolver/ # Puzzle solver components
│   ├── utils/          # Utility functions
│   │   └── dartboardUtils.ts # Dart board and puzzle calculation utilities
│   ├── types/          # TypeScript type definitions
│   │   └── DartBoard.ts # Type definitions for dart board components 
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
└── package.json        # Project dependencies and scripts
