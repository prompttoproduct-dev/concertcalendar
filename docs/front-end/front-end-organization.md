# Front-End Organization

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── [ComponentName]/ # Feature-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── assets/             # Static assets (images, fonts, etc.)
└── styles/             # Global styles and theme definitions
```

## Component Organization

### File Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with 'use' prefix (`useUserData.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Component Structure
```typescript
// ComponentName.tsx
import { ComponentProps } from './ComponentName.types'
import { useComponentLogic } from './ComponentName.hooks'
import './ComponentName.styles.css'

export const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  const { state, handlers } = useComponentLogic()
  
  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  )
}
```

## Import Organization
1. React and third-party libraries
2. Internal components and hooks
3. Types and interfaces
4. Constants and utilities
5. Styles (if not using CSS-in-JS)

## Folder Grouping Strategies
- **By Feature**: Group related components, hooks, and utilities
- **By Type**: Separate components, hooks, utilities into different folders
- **Hybrid**: Use feature-based grouping for complex features, type-based for shared code