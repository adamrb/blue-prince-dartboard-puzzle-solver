# Tech Stack

## Frontend Framework
- **React**: Component-based UI library for creating interactive interfaces
- **TypeScript**: Static typing to improve code quality and developer experience
- **Vite**: Fast build tool and development server

## Visualization
- **SVG**: Vector-based graphics for rendering the dart board
- **CSS modules**: Scoped styling for components

## State Management
- **React Hooks**: useState and useContext for managing component and application state

## Deployment
- **GitHub Pages**: Hosting platform for the compiled application
- **GitHub Actions**: CI/CD pipeline for automated deployment

## Development Tools
- **ESLint**: For code linting and ensuring code quality
- **Prettier**: For consistent code formatting

## Architecture Decisions

### SVG for Dart Board
We chose SVG for the dart board implementation because:
- SVG elements are individually addressable and can have event handlers
- Vector graphics scale perfectly at any resolution
- Precise control over shapes and paths for accurate dart board segments
- Easy styling and animations with CSS and JavaScript

### React + TypeScript
We chose React with TypeScript because:
- Strong typing helps prevent bugs and improves maintenance
- Component-based architecture fits well with our modular design
- Excellent ecosystem and community support
- Good performance for interactive applications
