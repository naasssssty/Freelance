# Frontend Tests

This directory contains unit tests for the FreelanceProject frontend application.

## Test Structure

```
src/
├── __tests__/
│   └── README.md (this file)
├── components/
│   └── __tests__/
│       ├── Header.test.js
│       └── ProjectCard.test.js
├── pages/
│   └── __tests__/
│       └── Login.test.js
├── services/
│   └── __tests__/
│       └── auth.test.js
├── utils/
│   └── __tests__/
│       └── auth.test.js
└── setupTests.js
```

## Test Categories

### 1. Component Tests (`components/__tests__/`)
- **Header.test.js**: Tests for the main navigation header component
- **ProjectCard.test.js**: Tests for project display and interaction functionality

### 2. Page Tests (`pages/__tests__/`)
- **Login.test.js**: Tests for login page functionality, form validation, and navigation

### 3. Service Tests (`services/__tests__/`)
- **auth.test.js**: Tests for authentication API calls and token management

### 4. Utility Tests (`utils/__tests__/`)
- **auth.test.js**: Tests for authentication utility functions like token decoding

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run linting
```bash
npm run lint
```

### Fix linting issues automatically
```bash
npm run lint:fix
```

## Coverage Thresholds

The project maintains the following minimum coverage thresholds:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

## Test Utilities

### Mocks
- **localStorage**: Mocked in setupTests.js
- **sessionStorage**: Mocked in setupTests.js
- **axios**: Mocked in individual test files
- **react-router-dom**: Mocked for navigation testing
- **jwt-decode**: Mocked for token testing

### Testing Libraries Used
- **@testing-library/react**: For component testing
- **@testing-library/jest-dom**: For enhanced DOM assertions
- **@testing-library/user-event**: For user interaction simulation
- **jest**: Test runner and assertion library

## Writing New Tests

When adding new tests, follow these guidelines:

1. **File Naming**: Use `.test.js` or `.spec.js` suffix
2. **Location**: Place tests in `__tests__` folders next to the code being tested
3. **Structure**: Use `describe` blocks to group related tests
4. **Mocking**: Mock external dependencies and API calls
5. **Assertions**: Use descriptive test names and clear assertions

### Example Test Structure
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
    beforeEach(() => {
        // Setup before each test
    });

    it('should render correctly', () => {
        render(<ComponentName />);
        expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });

    it('should handle user interactions', () => {
        render(<ComponentName />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        // Assert expected behavior
    });
});
```

## CI/CD Integration

Tests are automatically run in the Jenkins pipeline during the "Unit Tests" stage. The pipeline:

1. Installs dependencies
2. Runs linting
3. Executes unit tests with coverage
4. Publishes test results and coverage reports
5. Fails the build if tests fail or coverage is below threshold

## Troubleshooting

### Common Issues

1. **Mock Issues**: Ensure all external dependencies are properly mocked
2. **Async Tests**: Use `waitFor` for asynchronous operations
3. **Router Tests**: Wrap components with `BrowserRouter` when testing routing
4. **Coverage**: Check that all code paths are tested if coverage is low 