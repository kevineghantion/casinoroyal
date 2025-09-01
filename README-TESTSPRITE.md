# Casino Royal - TestSprite Testing Guide

## Overview

This project uses **TestSprite** - a comprehensive testing framework that provides complete coverage of all Casino Royal functionality including authentication, wallet management, game mechanics, security, and performance.

## Quick Start

### Run All Tests
```bash
npm run testsprite
```

### Run with Coverage
```bash
npm run testsprite:full
```

### Watch Mode
```bash
npm run test:watch
```

### UI Mode
```bash
npm run test:ui
```

## Test Structure

### 📁 Test Organization
```
src/__tests__/
├── comprehensive.test.ts      # Core functionality tests
├── components/
│   └── ui.test.tsx           # UI component tests
├── hooks/
│   └── hooks.test.ts         # Custom hooks tests
├── pages/
│   └── pages.test.tsx        # Page component tests
├── integration/
│   └── integration.test.ts   # End-to-end integration tests
├── testsprite-runner.ts      # TestSprite orchestrator
└── setup.ts                  # Test environment setup
```

## Test Coverage Areas

### 🔐 Authentication & Security
- User registration and login flows
- Session management and persistence
- Input validation and sanitization
- Rate limiting and security measures
- Password validation and encryption

### 💰 Wallet & Transaction System
- Deposit and withdrawal operations
- Balance calculations and updates
- Transaction history tracking
- Concurrent operation handling
- Error handling for insufficient funds

### 🎮 Game Mechanics
- Game validation and bet limits
- Random number generation
- Win/loss calculations
- Payout processing
- Game state management

### 🖥️ UI Components
- Button interactions and states
- Form validation and submission
- Modal behavior and accessibility
- Loading and error states
- Navigation and routing

### 🔗 Integration Flows
- Complete user journeys
- Cross-component communication
- State synchronization
- API integration patterns
- Error recovery mechanisms

### ⚡ Performance & Memory
- Concurrent operation handling
- Large dataset processing
- Memory usage optimization
- Caching mechanisms
- Response time validation

## Running Specific Test Suites

### Core Functionality
```bash
npx vitest run src/__tests__/comprehensive.test.ts
```

### UI Components
```bash
npx vitest run src/__tests__/components/
```

### Custom Hooks
```bash
npx vitest run src/__tests__/hooks/
```

### Page Components
```bash
npx vitest run src/__tests__/pages/
```

### Integration Tests
```bash
npx vitest run src/__tests__/integration/
```

## Test Configuration

### Vitest Config (`vitest.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./src/__tests__/setup.ts']
  }
});
```

### TestSprite Config (`testsprite.config.js`)
```javascript
export default {
  name: "Casino Royal",
  framework: "react",
  language: "typescript",
  testDir: "./src/__tests__",
  coverage: {
    enabled: true,
    threshold: 70
  }
};
```

## Test Examples

### Authentication Test
```typescript
it('should handle user login flow', async () => {
  const loginResult = await authSystem.login({
    email: 'test@example.com',
    password: 'password123'
  });
  
  expect(loginResult.success).toBe(true);
  expect(loginResult.user).toBeDefined();
});
```

### Wallet Test
```typescript
it('should process deposit correctly', async () => {
  const result = await walletSystem.deposit('user-1', 500);
  
  expect(result.success).toBe(true);
  expect(result.newBalance).toBe(1500);
});
```

### UI Component Test
```typescript
it('renders button and handles clicks', async () => {
  const handleClick = vi.fn();
  render(<NeonButton onClick={handleClick}>Click me</NeonButton>);
  
  await user.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Coverage Reports

### Generate Coverage Report
```bash
npm run test:coverage
```

### View Coverage in Browser
```bash
npm run test:ui
```

### Coverage Thresholds
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: TestSprite CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run testsprite:full
```

## Debugging Tests

### Debug Mode
```bash
npx vitest --inspect-brk
```

### Verbose Output
```bash
npx vitest run --reporter=verbose
```

### Watch Specific Files
```bash
npx vitest src/__tests__/hooks/useAuth.test.ts
```

## Mock Configuration

### Supabase Mocks
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    }
  }
}));
```

### Router Mocks
```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' })
}));
```

## Performance Testing

### Load Testing
```typescript
it('should handle concurrent operations', async () => {
  const operations = Array.from({ length: 100 }, (_, i) => 
    processOperation(i)
  );
  
  const results = await Promise.all(operations);
  expect(results).toHaveLength(100);
});
```

### Memory Testing
```typescript
it('should not leak memory', () => {
  for (let i = 0; i < 1000; i++) {
    const component = render(<TestComponent />);
    component.unmount();
  }
  // No memory leaks if test completes
});
```

## Security Testing

### Input Validation
```typescript
it('should sanitize malicious input', () => {
  const malicious = '<script>alert("xss")</script>';
  const sanitized = sanitizeInput(malicious);
  expect(sanitized).not.toContain('<script>');
});
```

### Rate Limiting
```typescript
it('should enforce rate limits', () => {
  for (let i = 0; i < 10; i++) {
    const result = rateLimiter.checkLimit('user-1');
    if (i >= 5) {
      expect(result.allowed).toBe(false);
    }
  }
});
```

## Best Practices

### 1. Test Structure
- Use descriptive test names
- Group related tests in describe blocks
- Keep tests focused and atomic
- Use proper setup and teardown

### 2. Assertions
- Use specific matchers
- Test both positive and negative cases
- Verify side effects
- Check error conditions

### 3. Mocking
- Mock external dependencies
- Use realistic mock data
- Verify mock interactions
- Clean up mocks between tests

### 4. Async Testing
- Use proper async/await patterns
- Handle promises correctly
- Test timeout scenarios
- Verify async state changes

## Troubleshooting

### Common Issues

#### Tests Not Running
```bash
# Check dependencies
npm install

# Verify test files exist
ls src/__tests__/

# Check configuration
cat vitest.config.ts
```

#### Mock Issues
```bash
# Clear mock cache
npx vitest run --no-cache

# Verify mock setup
cat src/__tests__/setup.ts
```

#### Coverage Issues
```bash
# Generate detailed coverage
npx vitest run --coverage --reporter=verbose

# Check coverage configuration
cat vitest.config.ts
```

## TestSprite Commands Reference

| Command | Description |
|---------|-------------|
| `npm run testsprite` | Run complete TestSprite suite |
| `npm run testsprite:full` | Run tests with coverage |
| `npm run test` | Run Vitest tests |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Generate coverage report |

## Integration with IDE

### VS Code Extensions
- **Vitest**: Official Vitest extension
- **Test Explorer**: Visual test runner
- **Coverage Gutters**: Inline coverage display

### Configuration
```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npx vitest",
  "testing.automaticallyOpenPeekView": "never"
}
```

## Reporting Issues

When reporting test issues, include:
1. Test command used
2. Error messages
3. Environment details
4. Relevant test files
5. Expected vs actual behavior

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `*.test.{ts,tsx}`
3. Include proper imports and setup
4. Add to TestSprite runner if needed
5. Update documentation

### Test Guidelines
- Maintain 80%+ coverage
- Test edge cases and error conditions
- Use realistic test data
- Keep tests fast and reliable
- Document complex test scenarios

---

**Casino Royal TestSprite** - Comprehensive testing for a production-ready casino application. 🎰✨