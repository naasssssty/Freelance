# Integration Tests

Αυτός ο φάκελος περιέχει integration tests για το frontend της εφαρμογής Freelancer Platform.

## Τι είναι τα Integration Tests

Τα Integration Tests ελέγχουν πώς διαφορετικά μέρη της εφαρμογής συνεργάζονται μεταξύ τους, σε αντίθεση με τα unit tests που ελέγχουν μεμονωμένα components.

## Δομή των Tests

### 1. `auth.integration.test.js`
- **Σκοπός**: Έλεγχος ολόκληρου authentication flow
- **Τι ελέγχει**:
  - Login και registration flow
  - Error handling για authentication
  - State management για authenticated users
  - Persistence του authentication state

### 2. `navigation.integration.test.js`
- **Σκοπός**: Έλεγχος navigation και routing
- **Τι ελέγχει**:
  - Public και protected routes
  - Role-based navigation
  - Header navigation functionality
  - PrivateRoute component behavior

### 3. `project-management.integration.test.js`
- **Σκοπός**: Έλεγχος project management functionality
- **Τι ελέγχει**:
  - Project creation flow
  - Project application process
  - Status management
  - Search και filtering
  - Notifications

### 4. `api-communication.integration.test.js`
- **Σκοπός**: Έλεγχος API communication
- **Τι ελέγχει**:
  - HTTP requests και responses
  - Error handling (4xx, 5xx errors)
  - Token management
  - Concurrent requests
  - Loading states και UI feedback

## Πώς να τρέξετε τα Integration Tests

### Τοπικά
```bash
cd frontend
npm test -- --testPathPattern="integration"
```

### Στο Jenkins Pipeline
Τα integration tests τρέχουν αυτόματα στο Jenkins pipeline στο stage "Integration Tests".

## Mock Strategy

Τα integration tests χρησιμοποιούν mocking για:
- **API calls**: Mock axios για να προσομοιώσουμε server responses
- **Redux store**: Mock store για state management testing
- **External services**: Mock notification services, etc.

## Best Practices

### 1. **Realistic Scenarios**
Τα tests προσομοιώνουν πραγματικά user scenarios:
```javascript
// ✅ Καλό - πραγματικό scenario
it('should complete full login flow successfully', async () => {
  // User fills login form
  // Submits form
  // Gets redirected to dashboard
});

// ❌ Κακό - πολύ specific
it('should call login API with correct parameters', async () => {
  // Πολύ low-level για integration test
});
```

### 2. **End-to-End User Flows**
```javascript
// ✅ Καλό - ολόκληρο flow
it('should create project and show success message', async () => {
  // Fill project form
  // Submit form
  // Verify project created
  // Verify success notification
});
```

### 3. **Error Scenarios**
```javascript
// ✅ Καλό - έλεγχος error handling
it('should handle API errors gracefully', async () => {
  // Mock API error
  // Trigger action
  // Verify error message shown to user
});
```

## Debugging Integration Tests

### 1. **Verbose Output**
```bash
npm test -- --testPathPattern="integration" --verbose
```

### 2. **Single Test File**
```bash
npm test -- src/__tests__/integration/auth.integration.test.js
```

### 3. **Debug Mode**
```bash
npm test -- --testPathPattern="integration" --runInBand --no-coverage
```

## Συχνά Προβλήματα

### 1. **Async Operations**
```javascript
// ✅ Σωστό - περιμένουμε async operations
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// ❌ Λάθος - δεν περιμένουμε
expect(screen.getByText(/success/i)).toBeInTheDocument();
```

### 2. **Mock Cleanup**
```javascript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

### 3. **State Management**
```javascript
// Πάντα να δημιουργείτε fresh store για κάθε test
const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};
```

## Επέκταση των Tests

### Προσθήκη νέου Integration Test

1. Δημιουργήστε νέο αρχείο: `new-feature.integration.test.js`
2. Ακολουθήστε το pattern:
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

// Mock dependencies
jest.mock('../../services/SomeService');

describe('New Feature Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature Flow', () => {
    it('should complete feature flow successfully', async () => {
      // Test implementation
    });
  });
});
```

## Μετρικές και Coverage

Τα integration tests συμβάλλουν στο overall test coverage και μετρούν:
- **Flow coverage**: Πόσα user flows καλύπτονται
- **Error coverage**: Πόσα error scenarios ελέγχονται
- **Integration coverage**: Πόσες integrations μεταξύ components ελέγχονται

## CI/CD Integration

Τα integration tests είναι ενσωματωμένα στο Jenkins pipeline και:
- Τρέχουν μετά τα unit tests
- Δεν σταματούν το pipeline αν αποτύχουν (development stage)
- Αρχειοθετούν τα αποτελέσματα για debugging
- Παρέχουν feedback για την ποιότητα των integrations 