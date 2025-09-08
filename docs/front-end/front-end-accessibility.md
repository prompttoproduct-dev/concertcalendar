# Front-End Accessibility Guidelines

## WCAG 2.1 Compliance

### Level A Requirements
- Provide text alternatives for images
- Ensure keyboard navigation works
- Use sufficient color contrast (4.5:1 for normal text)
- Make content readable and functional when zoomed to 200%

### Level AA Requirements
- Color contrast ratio of at least 4.5:1 for normal text
- Color contrast ratio of at least 3:1 for large text
- Ensure focus indicators are visible
- Provide captions for videos

## Semantic HTML

### Use Proper HTML Elements
```html
<!-- Good -->
<button onClick={handleClick}>Submit</button>
<nav aria-label="Main navigation">
<main>
<article>
<section>

<!-- Avoid -->
<div onClick={handleClick}>Submit</div>
```

### ARIA Labels and Roles
```typescript
// Screen reader friendly
<button aria-label="Close dialog" onClick={onClose}>
  <X aria-hidden="true" />
</button>

// Form labels
<label htmlFor="email">Email Address</label>
<input id="email" type="email" required />

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

## Keyboard Navigation

### Focus Management
- Ensure all interactive elements are keyboard accessible
- Implement proper focus trapping in modals
- Use skip links for main content
- Maintain logical tab order

### Focus Indicators
```css
/* Visible focus indicators */
.button:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

## Testing Accessibility

### Automated Testing
- Use axe-core for automated accessibility testing
- Integrate accessibility tests in CI/CD pipeline
- Use React Testing Library with accessibility queries

### Manual Testing
- Test with keyboard only
- Use screen readers (NVDA, JAWS, VoiceOver)
- Check color contrast with tools
- Validate with accessibility browser extensions

## Common Patterns

### Modal Dialogs
```typescript
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      // Trap focus within modal
      // Set focus to first focusable element
    }
  }, [isOpen])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {children}
    </div>
  )
}
```

### Form Validation
```typescript
// Accessible error messages
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-message" : undefined}
/>
{hasError && (
  <div id="error-message" role="alert">
    {errorMessage}
  </div>
)}
```