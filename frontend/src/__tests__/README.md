# Frontend Tests Documentation

## Overview

This directory contains comprehensive unit and integration tests for the FreelancerProject frontend application.

## Test Structure

```
src/
├── __tests__/
│   ├── testUtils.js          # Common test utilities and helpers
│   └── README.md             # This file
├── components/
│   └── __tests__/
│       ├── Header.test.js    # Header component tests
│       └── ProjectCard.test.js # ProjectCard component tests
├── pages/
│   └── __tests__/
│       └── Login.test.js     # Login page tests
├── services/
│   └── __tests__/
│       └── auth.test.js      # Authentication service tests
├── store/
│   └── __tests__/
│       └── authReducer.test.js # Auth reducer tests
├── utils/
│   └── __tests__/
│       └── auth.test.js      # Auth utility tests
└── App.test.js               # Main App component tests
```

## Test Categories

### 1. Unit Tests
- **Components**: Test individual React components in isolation
- **Services**: Test API service functions
- **Utilities**: Test helper functions and utilities
- **Reducers**: Test Redux reducers

### 2. Integration Tests
- **Component Integration**: Test components with their dependencies
- **Service Integration**: Test service interactions with mocked APIs

## Test Utilities

### `testUtils.js`
Provides common utilities for testing:

- **`renderWithProviders`**: Renders components with Redux store and Router
- **`createMockStore`**: Creates mock Redux store with default reducers
- **Mock Data**: Pre-defined mock data for users, projects, applications
- **Helper Functions**: Utilities for async operations and mocking

## Running Tests

### Basic Commands
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (with JUnit output)
npm run test:ci
```

### Test Patterns
```bash
# Run specific test file
npm test -- Header.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run tests for specific component
npm test -- --testPathPattern="components"
```

## Coverage Requirements

The project maintains the following coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

### 1. Test Structure
- Use `describe` blocks to group related tests
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern

### 2. Mocking
- Mock external dependencies (APIs, localStorage, etc.)
- Use `jest.mock()` for module mocking
- Clean up mocks in `afterEach` hooks

### 3. Async Testing
- Use `waitFor` for async operations
- Mock API responses appropriately
- Test both success and error scenarios

### 4. Component Testing
- Test user interactions (clicks, form submissions)
- Test conditional rendering
- Test prop handling
- Test state changes

## Example Test Structure

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../testUtils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  const defaultProps = {
    title: 'Test Title',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with correct title', () => {
    renderWithProviders(<MyComponent {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should call onClick when button is clicked', async () => {
    renderWithProviders(<MyComponent {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Debugging Tests

### Common Issues
1. **Component not rendering**: Check if all required props are provided
2. **Async operations failing**: Ensure proper use of `waitFor` and mocking
3. **Store-related errors**: Verify mock store configuration
4. **Router errors**: Ensure components are wrapped with `BrowserRouter`

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with debug information
npm test -- --detectOpenHandles

# Run single test in debug mode
node --inspect-brk node_modules/.bin/react-scripts test --runInBand --no-cache
```

## CI/CD Integration

Tests are integrated into the Jenkins pipeline with the following stages:

1. **Lint**: ESLint code quality checks
2. **Unit Tests**: Run all unit tests with coverage
3. **Integration Tests**: Run integration tests
4. **Security Audit**: Check for vulnerabilities
5. **Build Performance**: Analyze build size and performance

## Contributing

When adding new features:

1. Write tests for new components/functions
2. Ensure tests pass locally before pushing
3. Maintain or improve coverage percentages
4. Follow existing test patterns and conventions
5. Update this documentation if needed

## Test Data

Mock data is available in `testUtils.js`:
- `mockUsers`: Different user types (admin, client, freelancer)
- `mockProjects`: Projects in various states
- `mockApplications`: Application examples
- `mockNotifications`: Notification examples

Use these consistently across tests for better maintainability. 