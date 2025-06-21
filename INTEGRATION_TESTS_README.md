# Integration Tests Documentation

## 📋 Περιεχόμενα (Contents)

- [Τι είναι τα Integration Tests](#τι-είναι-τα-integration-tests)
- [Δομή των Tests](#δομή-των-tests)
- [Εκτέλεση των Tests](#εκτέλεση-των-tests)
- [Test Scenarios](#test-scenarios)
- [Βέλτιστες Πρακτικές](#βέλτιστες-πρακτικές)

## 🔍 Τι είναι τα Integration Tests

Τα Integration Tests ελέγχουν την **αλληλεπίδραση μεταξύ πολλών components** και την **ολοκληρωμένη λειτουργικότητα** της εφαρμογής. Σε αντίθεση με τα Unit Tests που ελέγχουν μεμονωμένες μονάδες κώδικα, τα Integration Tests ελέγχουν:

- **Workflows**: Ολόκληρες διαδικασίες χρήστη (π.χ. login → dashboard → logout)
- **Component Interactions**: Πώς τα components επικοινωνούν μεταξύ τους
- **State Management**: Redux store updates και data flow
- **API Integration**: Πώς το frontend αλληλεπιδρά με τα backend services
- **User Journeys**: Πραγματικά σενάρια χρήσης

## 🏗️ Δομή των Tests

```
frontend/src/__tests__/integration/
├── auth-flow.integration.test.js          # Authentication workflows
├── chat-workflow.integration.test.js      # Chat functionality
├── project-management.integration.test.js # Project CRUD operations
└── user-profile.integration.test.js       # Profile management
```

### Test File Structure

Κάθε integration test file ακολουθεί αυτή τη δομή:

```javascript
// 1. Imports και Mocks
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

// 2. Mock Services
jest.mock('../../services/serviceName');

// 3. Test Utilities
const renderWithProviders = (component, { initialState = {} } = {}) => {
  // Redux store setup
  // Router setup
  // Return render result
};

// 4. Test Suites
describe('Feature Integration Tests', () => {
  // Setup
  beforeEach(() => {
    // Mock reset και configuration
  });

  describe('Scenario Group', () => {
    it('should complete workflow successfully', async () => {
      // Test implementation
    });
  });
});
```

## 🚀 Εκτέλεση των Tests

### Local Development

```bash
# Όλα τα integration tests
npm run test:integration

# Μόνο unit tests
npm run test:unit

# Όλα τα tests (unit + integration)
npm run test:all

# Με coverage
npm run test:coverage
```

### Jenkins Pipeline

Τα integration tests τρέχουν αυτόματα στο Jenkins pipeline:

```
1. Unit Tests Stage      → Τρέχει unit tests
2. Integration Tests Stage → Τρέχει integration tests
3. Build Stage           → Αν όλα πέρασαν επιτυχώς
```

## 🎯 Test Scenarios

### 1. Authentication Flow (`auth-flow.integration.test.js`)

**Scenarios που καλύπτει:**
- ✅ Complete login workflow (form → API → redirect)
- ✅ Login error handling και validation
- ✅ Authentication state persistence
- ✅ Protected routes access control
- ✅ Logout functionality

**Key Features:**
```javascript
// Ολόκληρο login workflow
it('should complete full login workflow', async () => {
  // 1. Render login form
  // 2. Fill credentials
  // 3. Submit form
  // 4. Verify API call
  // 5. Check state update
  // 6. Verify redirect
});
```

### 2. Chat Workflow (`chat-workflow.integration.test.js`)

**Scenarios που καλύπτει:**
- ✅ Chat list loading και display
- ✅ Message loading when chat selected
- ✅ Message sending workflow
- ✅ Real-time updates (Socket.IO integration)
- ✅ Chat search και filtering
- ✅ Error handling

**Key Features:**
```javascript
// Complete chat interaction
it('should send message and update chat interface', async () => {
  // 1. Load chats
  // 2. Select chat
  // 3. Load messages
  // 4. Type message
  // 5. Send message
  // 6. Verify API call
  // 7. Check UI update
});
```

### 3. Project Management (`project-management.integration.test.js`)

**Scenarios που καλύπτει:**
- ✅ Project listing με filtering
- ✅ Project creation workflow
- ✅ Project details loading
- ✅ Project status updates
- ✅ Application submission (freelancers)
- ✅ Project deletion με confirmation

**Key Features:**
```javascript
// Complete project creation
it('should create a new project with complete workflow', async () => {
  // 1. Click create button
  // 2. Fill project form
  // 3. Add skills
  // 4. Set deadline
  // 5. Submit form
  // 6. Verify API call
  // 7. Check success message
});
```

### 4. User Profile (`user-profile.integration.test.js`)

**Scenarios που καλύπτει:**
- ✅ Profile loading και display
- ✅ Basic profile updates
- ✅ Skills management (add/remove)
- ✅ Avatar upload με validation
- ✅ Password change workflow
- ✅ Account deletion με confirmation
- ✅ Social links management

**Key Features:**
```javascript
// Complete profile update
it('should update basic profile information', async () => {
  // 1. Load profile
  // 2. Update fields
  // 3. Save changes
  // 4. Verify API call
  // 5. Check success message
});
```

## 🛠️ Test Utilities

### `renderWithProviders`

Utility function που παρέχει:
- **Redux Provider** με mock store
- **React Router** για navigation
- **Custom initial state** για κάθε test

```javascript
const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store
  };
};
```

### Mock Services

Όλα τα services γίνονται mock για:
- **Predictable responses**
- **Error simulation**
- **Performance** (δεν κάνουν πραγματικά API calls)

```javascript
// Mock successful response
authService.login.mockResolvedValue({
  data: { token: 'mock.jwt.token', user: mockUser }
});

// Mock error response
authService.login.mockRejectedValue({
  response: { data: { message: 'Invalid credentials' } }
});
```

## ✅ Βέλτιστες Πρακτικές

### 1. Test Naming
```javascript
// ✅ Καλό: Περιγράφει το complete scenario
it('should complete full login workflow', async () => {});

// ❌ Κακό: Πολύ generic
it('should login', async () => {});
```

### 2. Async Testing
```javascript
// ✅ Χρήση waitFor για async operations
await waitFor(() => {
  expect(screen.getByText('Success message')).toBeInTheDocument();
});

// ❌ Δεν περιμένει async operations
expect(screen.getByText('Success message')).toBeInTheDocument();
```

### 3. User-Centric Queries
```javascript
// ✅ Χρήση user-centric queries
screen.getByRole('button', { name: /sign in/i })
screen.getByLabelText(/username/i)

// ❌ Implementation details
screen.getByTestId('login-button')
```

### 4. Error Scenarios
```javascript
// ✅ Test both success και error cases
it('should handle login error gracefully', async () => {
  // Mock error response
  authService.login.mockRejectedValue(error);
  
  // Perform action
  // Verify error handling
});
```

### 5. State Verification
```javascript
// ✅ Verify both API calls και state changes
await waitFor(() => {
  expect(authService.login).toHaveBeenCalledWith(credentials);
});

// Check UI updates
expect(screen.getByText(/welcome/i)).toBeInTheDocument();
```

## 📊 Coverage και Metrics

### Coverage Targets
- **Integration Tests**: 70%+ των critical workflows
- **Combined Coverage**: 80%+ (unit + integration)

### Key Metrics
- **Workflow Coverage**: Όλα τα main user journeys
- **Error Handling**: Happy path + error scenarios
- **State Management**: Redux actions και reducers
- **API Integration**: Service calls και responses

## 🔧 Troubleshooting

### Common Issues

1. **Async Timing Issues**
   ```javascript
   // ✅ Solution: Use waitFor
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   });
   ```

2. **Mock Not Working**
   ```javascript
   // ✅ Ensure mock is in beforeEach
   beforeEach(() => {
     jest.clearAllMocks();
     service.method.mockResolvedValue(mockData);
   });
   ```

3. **State Not Updating**
   ```javascript
   // ✅ Check initial state setup
   const initialState = {
     auth: { user: mockUser, isAuthenticated: true }
   };
   ```

## 🚀 Future Enhancements

### Planned Additions
- **E2E Tests** με Cypress/Playwright
- **Visual Regression Tests**
- **Performance Integration Tests**
- **Accessibility Integration Tests**
- **Mobile Integration Tests**

### Test Data Management
- **Test Fixtures** για consistent data
- **Factory Functions** για test data generation
- **Database Seeding** για E2E tests

---

## 📞 Support

Για ερωτήσεις σχετικά με τα Integration Tests:
1. Check αυτό το documentation
2. Review existing test examples
3. Ρώτησε στο team chat

**Happy Testing!** 🧪✨ 