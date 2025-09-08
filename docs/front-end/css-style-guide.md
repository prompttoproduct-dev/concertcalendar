# CSS Style Guide

## CSS Architecture

### Methodology: Tailwind + CSS Custom Properties
- Use Tailwind utility classes for most styling
- Use CSS custom properties for design tokens
- Create component-specific CSS only when necessary
- Follow BEM methodology for custom CSS classes

## Naming Conventions

### CSS Custom Properties
```css
/* Design tokens */
--cd-color-primary: hsl(348 83% 47%);
--cd-space-4: 1rem;
--cd-radius-lg: 0.5rem;

/* Component-specific */
--concert-card-shadow: 0 4px 16px hsl(var(--cd-night) / 0.1);
--search-input-height: 3rem;
```

### CSS Classes (when needed)
```css
/* BEM methodology */
.concert-card { }
.concert-card__header { }
.concert-card__title { }
.concert-card--featured { }
.concert-card--sold-out { }
```

## Tailwind Best Practices

### Utility Organization
```typescript
// Group related utilities
const cardClasses = cn(
  // Layout
  'flex flex-col',
  // Spacing
  'p-6 gap-4',
  // Appearance
  'bg-card rounded-lg border',
  // Interactive states
  'hover:shadow-lg transition-smooth',
  // Responsive
  'md:p-8 lg:flex-row'
)
```

### Custom Utilities
```css
/* tailwind.config.ts */
theme: {
  extend: {
    utilities: {
      '.text-balance': {
        'text-wrap': 'balance',
      },
      '.scrollbar-hide': {
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      },
    }
  }
}
```

## Component Styling Patterns

### Container Queries (when supported)
```css
.concert-grid {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .concert-card {
    flex-direction: row;
  }
}
```

### CSS Grid Layouts
```css
.concert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--cd-space-6);
}

.hero-layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "content sidebar"
    "footer footer";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr 300px;
  min-height: 100vh;
}
```

### Flexbox Patterns
```css
/* Center content */
.center-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Space between items */
.space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Flexible grid */
.flex-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cd-space-4);
}

.flex-grid > * {
  flex: 1 1 300px;
}
```

## Animation & Transitions

### Performance-First Animations
```css
/* Only animate transform and opacity for performance */
.slide-in {
  transform: translateX(-100%);
  transition: transform 300ms ease-out;
}

.slide-in.active {
  transform: translateX(0);
}

/* Use will-change sparingly */
.animating-element {
  will-change: transform;
}

.animating-element.animation-complete {
  will-change: auto;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Design

### Mobile-First Approach
```css
/* Base styles for mobile */
.concert-card {
  padding: var(--cd-space-4);
  flex-direction: column;
}

/* Tablet and up */
@media (min-width: 768px) {
  .concert-card {
    padding: var(--cd-space-6);
    flex-direction: row;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .concert-card {
    padding: var(--cd-space-8);
  }
}
```

### Fluid Typography
```css
.fluid-text {
  font-size: clamp(1rem, 2.5vw, 2rem);
  line-height: 1.4;
}
```

## Performance Optimization

### CSS Loading Strategy
```css
/* Critical CSS inline in <head> */
/* Non-critical CSS loaded asynchronously */

/* Use CSS containment for performance */
.concert-list {
  contain: layout style paint;
}

.concert-card {
  contain: layout paint;
}
```

### Efficient Selectors
```css
/* Good - specific and efficient */
.concert-card__title { }
.btn--primary { }

/* Avoid - overly complex selectors */
.page .content .section .card .header .title { }
```

## Code Organization

### File Structure
```
styles/
├── globals.css          # Global styles and resets
├── components/          # Component-specific styles
│   ├── concert-card.css
│   └── search-form.css
├── utilities/           # Custom utility classes
│   ├── animations.css
│   └── layout.css
└── tokens/              # Design token definitions
    ├── colors.css
    ├── typography.css
    └── spacing.css
```

### Import Order
```css
/* 1. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Design tokens */
@import './tokens/colors.css';
@import './tokens/typography.css';

/* 3. Component styles */
@import './components/concert-card.css';

/* 4. Utility overrides */
@import './utilities/animations.css';
```

## Debugging & Maintenance

### CSS Custom Properties for Debugging
```css
:root {
  --debug-mode: 0; /* Set to 1 for debugging */
}

.debug-grid {
  background-image: 
    linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: var(--debug-mode);
}
```

### Documentation Comments
```css
/**
 * Concert Card Component
 * 
 * A flexible card component for displaying concert information.
 * Supports multiple variants and responsive layouts.
 * 
 * @example
 * <div class="concert-card concert-card--featured">
 *   <div class="concert-card__header">...</div>
 *   <div class="concert-card__content">...</div>
 * </div>
 */
.concert-card {
  /* Implementation */
}
```