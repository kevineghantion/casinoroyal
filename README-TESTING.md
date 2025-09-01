# Casino Royal - Testing Guide

## TestSprite Setup

### Installation
```bash
npm install
```

### Running Tests

#### Basic Tests
```bash
npm test                 # Run all tests
npm run test:ui         # Run with UI interface
npm run test:coverage   # Run with coverage report
```

#### TestSprite Commands
```bash
npm run testsprite      # Run TestSprite analysis
testsprite init         # Initialize TestSprite (if needed)
testsprite generate     # Generate additional tests
```

### Test Structure

```
src/__tests__/
├── setup.ts                 # Test configuration
├── mocks/                   # Mock implementations
├── components/              # Component tests
│   ├── Navbar.test.tsx
│   └── NeonButton.test.tsx
├── hooks/                   # Hook tests
│   └── useAuth.test.ts
└── pages/                   # Page tests
    └── Login.test.tsx
```

### Key Test Areas

1. **Authentication Flow**
   - Login/logout functionality
   - Session management
   - Profile handling

2. **UI Components**
   - Navbar navigation
   - Button interactions
   - Form validation

3. **Hooks**
   - useAuth state management
   - useBalance operations
   - useSFX sound effects

### Coverage Goals
- Minimum 70% code coverage
- All critical auth flows tested
- UI component interactions verified

### TestSprite Features
- Automated test generation
- Coverage analysis
- Performance testing
- Accessibility checks

### Running Specific Tests
```bash
npm test -- --run components  # Component tests only
npm test -- --run hooks       # Hook tests only
npm test -- --watch          # Watch mode
```