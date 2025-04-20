# The Blue Prince: Billiard Room Dartboard Puzzle Solver

An interactive web-based tool to solve the dartboard puzzle in the Billiard Room of the video game "The Blue Prince". This open source application helps players calculate the correct solutions to the mathematical dart puzzles encountered during gameplay.

## What is the Billiards Room Dartboard Puzzle?

In the video game "The Blue Prince" by Dogubomb and Raw Fury, players encounter a recurring mathematical puzzle in the Billiard Room featuring a dartboard. This puzzle is not based on traditional darts gameplay, but instead requires solving mathematical equations based on colored dartboard segments.

### Puzzle Mechanics:

- Each color on the dartboard represents a different mathematical operation:
  - **Blue**: Addition (+)
  - **Yellow/Orange**: Subtraction (-)
  - **Pink**: Multiplication (×)
  - **Purple**: Division (÷)

- The order of operations ignores traditional PEMDAS rules, and instead proceeds from the inner rings (closer to the bullseye) to the outer rings.

- As players progress in the game, the puzzles become more complex, introducing additional symbols in the bullseye that modify calculations:
  - Square: Square the result (^2)
  - Diamond: Reverse the digits
  - Red dots: Repeat the step multiple times
  - Red X: Skip this step
  - Red slash: Divide the result by two
  - Squiggly lines: Round to the nearest 1, 10, or 100 (depending on number of lines)
  - Partial color fill: Divide by three

## How This Solver Works

This web-based tool helps players solve these puzzles with an interactive visual interface:

1. **Mark Segments**: Click on dartboard segments to mark them with the appropriate colors
2. **Calculate Solutions**: The app automatically performs calculations based on the marked segments
3. **View Results Step-by-Step**: See the equation unfold from inner to outer ring with each step shown
4. **Get Final Answers**: The app displays the final result that should be selected on the dartboard

The solver follows the same mathematical rules as the game, making it an ideal companion for players struggling with the more complex equations encountered in later runs.

## Live Demo

Try it now: [The Blue Prince Dartboard Puzzle Solver](https://yourusername.github.io/blue-prince-dartboard-puzzle-solver/)

## Features

- Interactive SVG-based dartboard with clickable segments matching the game's layout
- Visual color coding for each mathematical operation (blue, yellow, pink, purple)
- Calculation of equations following the game's specific order of operations rules
- Support for basic and advanced puzzle mechanics 
- Responsive design that works on both desktop and mobile devices
- Open source code that can be extended by the community

## Technologies Used

- React 18 with TypeScript
- Vite for fast builds and development
- SVG for vector-based graphics
- GitHub Pages for hosting

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/blue-prince-dartboard-puzzle-solver.git
   cd blue-prince-dartboard-puzzle-solver
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## How to Use

1. **Select Operation Colors**: Choose which color (operation) you want to apply
2. **Click Segments**: Click on dartboard segments to mark them with the selected color
3. **Review Calculation**: The solver will display the mathematical steps and final result
4. **Reset as Needed**: Clear selections to solve a different puzzle configuration

## Project Structure

```
blue-prince-dartboard-puzzle-solver/
├── cline_docs/         # Project documentation
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   ├── DartBoard/  # Dart board related components
│   │   └── PuzzleSolver/ # Puzzle solver components 
│   ├── utils/          # Utility functions
│   │   └── dartboardUtils.ts # Dart board and puzzle calculation utilities
│   ├── types/          # TypeScript type definitions
│   │   └── DartBoard.ts # Type definitions for dart board components
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
└── package.json        # Project dependencies and scripts
```

## Contributing

Contributions are welcome! Feel free to submit a Pull Request or open an Issue to discuss improvements or report bugs.

## About The Blue Prince

"The Blue Prince" is a video game developed by Dogubomb and published by Raw Fury. This tool is a fan-created project and is not officially affiliated with the game's developers or publishers.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## References

- [Game Official Website](https://rawfury.com/games/blue-prince/)
- [The Blue Prince on Steam](https://store.steampowered.com/app/1569580/The_Blue_Prince/)
- [Dartboard Puzzle Guide on Polygon](https://www.polygon.com/blue-prince-guides/554634/darts-puzzle-billiard-room-how-to-solve-answers)
- [GameSpot Billiards Puzzle Guide](https://www.gamespot.com/gallery/blue-prince-billiards-darts-puzzle-solution/2900-6422/)
- [IGN Dartboard Puzzle Walkthrough](https://www.ign.com/wikis/blue-prince/How_to_Solve_the_Billiard_Room_Dartboard_Puzzle)
