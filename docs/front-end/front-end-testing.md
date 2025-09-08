# Front-End Testing Strategy

## Testing Pyramid

### Unit Tests (70%)
- Test individual functions and components in isolation
- Focus on business logic and edge cases
- Use Jest and React Testing Library

### Integration Tests (20%)
- Test component interactions
- Test API integrations
- Test user workflows

### End-to-End Tests (10%)
- Test critical user journeys
- Use Playwright or Cypress
- Run in CI/CD pipeline

## Testing Tools

### Core Testing Stack
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking
- **Playwright**: E2E testing framework

### Testing Utilities
```typescript
// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: RenderOptions
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}
```

## Component Testing Patterns

### Testing User Interactions
```typescript
test('should submit form when valid data is entered', async () => {
  const mockSubmit = jest.fn()
  render(<ContactForm onSubmit={mockSubmit} />)

  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/message/i), 'Hello world')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    message: 'Hello world'
  })
})
```

### Testing Async Behavior
```typescript
test('should display loading state then results', async () => {
  render(<SearchResults query="test" />)

  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.getByText(/results found/i)).toBeInTheDocument()
  })
})
```

## API Testing

### Mocking with MSW
```typescript
// handlers.ts
export const handlers = [
  rest.get('/api/concerts', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, artist: 'Test Artist', venue: 'Test Venue' }
      ])
    )
  })
]

// test setup
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## E2E Testing

### Critical User Flows
```typescript
// search-concerts.spec.ts
test('user can search for concerts', async ({ page }) => {
  await page.goto('/')
  
  await page.fill('[placeholder*="search"]', 'indie rock')
  await page.click('button:has-text("Search")')
  
  await expect(page.locator('[data-testid="concert-card"]')).toHaveCount(3)
  await expect(page.locator('text=indie rock')).toBeVisible()
})
```

## Testing Best Practices

### What to Test
- User interactions and workflows
- Error states and edge cases
- Accessibility compliance
- Performance regressions

### What Not to Test
- Implementation details
- Third-party library internals
- Styling (unless functional)
- Trivial getters/setters

### Test Organization
```
__tests__/
├── components/
│   ├── ConcertCard.test.tsx
│   └── SearchForm.test.tsx
├── hooks/
│   └── useSearch.test.ts
├── utils/
│   └── formatDate.test.ts
└── e2e/
    ├── search.spec.ts
    └── booking.spec.ts
```