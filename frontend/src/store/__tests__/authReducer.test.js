import authReducer from '../authReducer';

describe('authReducer', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle LOGIN_START', () => {
    const action = { type: 'LOGIN_START' };
    const expectedState = {
      ...initialState,
      loading: true,
      error: null
    };

    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGIN_SUCCESS', () => {
    const user = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'CLIENT'
    };
    
    const action = {
      type: 'LOGIN_SUCCESS',
      payload: user
    };
    
    const expectedState = {
      ...initialState,
      user,
      isAuthenticated: true,
      loading: false,
      error: null
    };

    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGIN_FAILURE', () => {
    const error = 'Invalid credentials';
    const action = {
      type: 'LOGIN_FAILURE',
      payload: error
    };
    
    const expectedState = {
      ...initialState,
      loading: false,
      error,
      isAuthenticated: false
    };

    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGOUT', () => {
    const authenticatedState = {
      user: { id: 1, username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      error: null
    };
    
    const action = { type: 'LOGOUT' };

    expect(authReducer(authenticatedState, action)).toEqual(initialState);
  });

  it('should handle REGISTER_START', () => {
    const action = { type: 'REGISTER_START' };
    const expectedState = {
      ...initialState,
      loading: true,
      error: null
    };

    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle REGISTER_SUCCESS', () => {
    const user = {
      id: 2,
      username: 'newuser',
      email: 'newuser@example.com',
      role: 'FREELANCER'
    };
    
    const action = {
      type: 'REGISTER_SUCCESS',
      payload: user
    };
    
    const expectedState = {
      ...initialState,
      user,
      isAuthenticated: true,
      loading: false,
      error: null
    };

    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle REGISTER_FAILURE', () => {
    const error = 'Username already exists';
    const action = {
      type: 'REGISTER_FAILURE',
      payload: error
    };
    
    const expectedState = {
      ...initialState,
      loading: false,
      error,
      isAuthenticated: false
    };

    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_ERROR', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error'
    };
    
    const action = { type: 'CLEAR_ERROR' };
    const expectedState = {
      ...stateWithError,
      error: null
    };

    expect(authReducer(stateWithError, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_USER', () => {
    const currentUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'CLIENT'
    };
    
    const authenticatedState = {
      ...initialState,
      user: currentUser,
      isAuthenticated: true
    };
    
    const updatedUserData = {
      email: 'newemail@example.com',
      verified: true
    };
    
    const action = {
      type: 'UPDATE_USER',
      payload: updatedUserData
    };
    
    const expectedState = {
      ...authenticatedState,
      user: {
        ...currentUser,
        ...updatedUserData
      }
    };

    expect(authReducer(authenticatedState, action)).toEqual(expectedState);
  });

  it('should not mutate original state', () => {
    const originalState = {
      user: { id: 1, username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      error: null
    };
    
    const action = { type: 'LOGOUT' };
    const newState = authReducer(originalState, action);
    
    // Original state should not be modified
    expect(originalState).toEqual({
      user: { id: 1, username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      error: null
    });
    
    // New state should be different
    expect(newState).toEqual(initialState);
    expect(newState).not.toBe(originalState);
  });

  it('should handle unknown action types', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    
    expect(authReducer(initialState, action)).toEqual(initialState);
  });

  it('should preserve state for unknown actions', () => {
    const currentState = {
      user: { id: 1, username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      error: null
    };
    
    const action = { type: 'UNKNOWN_ACTION' };
    
    expect(authReducer(currentState, action)).toEqual(currentState);
  });
}); 