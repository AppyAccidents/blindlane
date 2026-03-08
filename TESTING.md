# 🧪 Testing Guide for BlindLane

> Comprehensive testing documentation for developers and AI agents

---

## 📋 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

---

## 🗂️ Test Structure

```
__tests__/
├── setup.ts                    # Test environment configuration
├── mocks/                      # Mock implementations
│   └── supabase.ts            # Supabase, OpenAI, Anthropic mocks
├── unit/                       # Unit tests
│   ├── lib/
│   │   ├── utils.test.ts      # Utility functions
│   │   └── constants.test.ts  # Environment constants
│   └── types/
│       └── index.test.ts      # Type definitions & models
└── integration/               # Integration tests
    └── api/
        ├── comparison.test.ts # POST /api/comparison
        ├── vote.test.ts       # POST /api/comparison/vote
        └── stats.test.ts      # GET /api/stats
```

---

## 🎯 Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Utility Functions | 100% | 🔄 In Progress |
| Constants & Types | 100% | 🔄 In Progress |
| API Routes | 90%+ | 🔄 In Progress |
| Database Operations | All public functions | 🔄 In Progress |
| Components | Critical paths | 📋 Planned |

---

## 📝 Writing Tests

### Test Naming Convention

```typescript
// Pattern: should [expected behavior] when [condition]
it('should calculate cost correctly for GPT-4o Mini', () => {
  // test code
});

// Group related tests
describe('calculateCost', () => {
  it('should handle zero tokens', () => { });
  it('should round to 6 decimal places', () => { });
});
```

### Test Structure (AAA Pattern)

```typescript
it('should validate prompt correctly', () => {
  // Arrange: Set up test data
  const prompt = 'Test prompt';
  
  // Act: Execute the function
  const result = validatePrompt(prompt);
  
  // Assert: Check the outcome
  expect(result.isValid).toBe(true);
});
```

### Mocking External APIs

```typescript
// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  getVoteStats: jest.fn(),
  getDailyCost: jest.fn(),
}));

// Use mock functions
import { getVoteStats } from '@/lib/supabase';

beforeEach(() => {
  (getVoteStats as jest.Mock).mockResolvedValue([
    { model_name: 'gpt-4o-mini', wins: 10, losses: 5 },
  ]);
});
```

---

## 🔍 Test Categories

### Unit Tests

Test individual functions in isolation:

```bash
npm run test:unit
```

**What to test:**
- Utility functions (`lib/utils.ts`)
- Cost calculations
- Input validation
- Data formatting
- Constants and configuration

### Integration Tests

Test API endpoints with mocked dependencies:

```bash
npm run test:integration
```

**What to test:**
- Request/response flow
- Validation logic
- Error handling
- Database interactions (mocked)
- Rate limiting
- Budget checks

---

## 🎭 Using Mocks

### Available Mocks

Located in `__tests__/mocks/supabase.ts`:

```typescript
import {
  createMockComparison,
  createMockVoteStats,
  createMockSupabaseClient,
  createMockOpenAIClient,
  createMockAnthropicClient,
  createMockNextRequest,
} from '@/__tests__/mocks/supabase';

// Create mock data
const comparison = createMockComparison({
  winner: 'A',
  cost_a_usd: 0.0001,
});

// Create mock request
const request = createMockNextRequest({
  method: 'POST',
  body: { prompt: 'Test' },
  ip: '192.168.1.1',
});
```

### Customizing Mocks

```typescript
// Override default mock behavior
const mockClient = createMockSupabaseClient({
  comparisonData: { id: 'custom-id' },
  statsData: [{ model_name: 'gpt-4o-mini', wins: 100 }],
  error: null,
});
```

---

## 📊 Coverage Reports

Generate detailed coverage reports:

```bash
npm run test:coverage
```

Output includes:
- `text`: Terminal summary
- `text-summary`: Brief overview
- `lcov`: HTML report in `coverage/`

View HTML report:
```bash
open coverage/lcov-report/index.html
```

---

## 🚨 Common Issues

### "Cannot find module '@/...'"

Make sure the path mapping is correct in `jest.config.js`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
},
```

### "Response.json is not a function"

API route tests need proper mocking:
```typescript
const response = await POST(request);
const data = await response.json(); // This works with our mock
```

### Environment variables not set

Tests load `.env.test` or use defaults in `__tests__/setup.ts`:
```typescript
process.env.DAILY_BUDGET_LIMIT = '10';
```

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] All tests pass (`npm test`)
- [ ] Coverage meets targets (`npm run test:coverage`)
- [ ] New tests added for new code
- [ ] No `console.log` in test code
- [ ] Tests are deterministic (no random failures)
- [ ] Mock data is realistic
- [ ] Edge cases covered (null, undefined, empty)

---

## 🔧 Configuration

### Jest Configuration

See `jest.config.js` for full configuration:

```javascript
{
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'types/**/*.{ts,tsx}',
    'app/api/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Test Environment

Configured in `__tests__/setup.ts`:
- Global mocks for `next/headers`
- Suppressed console noise
- Custom matchers
- Environment variables

---

## 📝 Adding New Tests

### For a New Utility Function

1. Add test file: `__tests__/unit/lib/newUtil.test.ts`
2. Import function: `import { newUtil } from '@/lib/newUtil'`
3. Write tests following AAA pattern
4. Run tests: `npm test -- newUtil`

### For a New API Route

1. Add test file: `__tests__/integration/api/newRoute.test.ts`
2. Mock dependencies with `jest.mock()`
3. Create mock requests with `createMockNextRequest()`
4. Test success and error cases
5. Verify response structure

### For a New Component

1. Add test file: `__tests__/unit/components/MyComponent.test.tsx`
2. Use React Testing Library:
   ```typescript
   import { render, screen } from '@testing-library/react';
   import { MyComponent } from '@/app/components/MyComponent';
   
   it('should render correctly', () => {
     render(<MyComponent />);
     expect(screen.getByText('Hello')).toBeInTheDocument();
   });
   ```

---

## 🐛 Debugging Tests

### Run a Single Test

```bash
npm test -- --testNamePattern="should calculate cost"
```

### Run Tests for Specific File

```bash
npm test -- utils.test.ts
```

### Verbose Output

```bash
npm test -- --verbose
```

### Debug Mode

Add `debugger` statement in test:
```typescript
it('should debug', () => {
  debugger; // Will pause here
  const result = myFunction();
});
```

Run with Node inspector:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 🤝 Contributing Tests

When adding tests:

1. Follow existing naming conventions
2. Use descriptive test names
3. Group related tests with `describe`
4. Clean up mocks in `afterEach`
5. Add edge case coverage
6. Update this documentation if needed

---

**Last Updated:** March 2026  
**Test Framework:** Jest 29.x + React Testing Library  
**Coverage Tool:** Istanbul (built into Jest)
