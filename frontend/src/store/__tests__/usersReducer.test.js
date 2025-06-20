import usersReducer from '../usersReducer';

describe('usersReducer', () => {
  const initialState = {
    users: [],
    loading: false,
    error: null,
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1
  };

  it('should return the initial state', () => {
    expect(usersReducer(undefined, {})).toEqual(initialState);
  });

  describe('FETCH_USERS actions', () => {
    it('should handle FETCH_USERS_REQUEST', () => {
      const action = {
        type: 'FETCH_USERS_REQUEST'
      };

      const expectedState = {
        ...initialState,
        loading: true,
        error: null
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle FETCH_USERS_SUCCESS', () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER',
          verified: true
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          role: 'CLIENT',
          verified: false
        }
      ];

      const action = {
        type: 'FETCH_USERS_SUCCESS',
        payload: {
          users: mockUsers,
          totalUsers: 2,
          totalPages: 1,
          currentPage: 1
        }
      };

      const expectedState = {
        ...initialState,
        loading: false,
        users: mockUsers,
        totalUsers: 2,
        totalPages: 1,
        currentPage: 1,
        error: null
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle FETCH_USERS_FAILURE', () => {
      const errorMessage = 'Failed to fetch users';
      const action = {
        type: 'FETCH_USERS_FAILURE',
        payload: errorMessage
      };

      const expectedState = {
        ...initialState,
        loading: false,
        error: errorMessage
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe('ADD_USER actions', () => {
    it('should handle ADD_USER_SUCCESS', () => {
      const existingUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER'
        }
      ];

      const newUser = {
        id: 2,
        username: 'user2',
        email: 'user2@example.com',
        role: 'CLIENT'
      };

      const currentState = {
        ...initialState,
        users: existingUsers,
        totalUsers: 1
      };

      const action = {
        type: 'ADD_USER_SUCCESS',
        payload: newUser
      };

      const expectedState = {
        ...currentState,
        users: [...existingUsers, newUser],
        totalUsers: 2
      };

      expect(usersReducer(currentState, action)).toEqual(expectedState);
    });

    it('should handle ADD_USER_FAILURE', () => {
      const errorMessage = 'Failed to add user';
      const action = {
        type: 'ADD_USER_FAILURE',
        payload: errorMessage
      };

      const expectedState = {
        ...initialState,
        error: errorMessage
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe('UPDATE_USER actions', () => {
    it('should handle UPDATE_USER_SUCCESS', () => {
      const existingUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER',
          verified: false
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          role: 'CLIENT',
          verified: true
        }
      ];

      const updatedUser = {
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        role: 'FREELANCER',
        verified: true
      };

      const currentState = {
        ...initialState,
        users: existingUsers
      };

      const action = {
        type: 'UPDATE_USER_SUCCESS',
        payload: updatedUser
      };

      const expectedState = {
        ...currentState,
        users: [updatedUser, existingUsers[1]]
      };

      expect(usersReducer(currentState, action)).toEqual(expectedState);
    });

    it('should handle UPDATE_USER_FAILURE', () => {
      const errorMessage = 'Failed to update user';
      const action = {
        type: 'UPDATE_USER_FAILURE',
        payload: errorMessage
      };

      const expectedState = {
        ...initialState,
        error: errorMessage
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe('DELETE_USER actions', () => {
    it('should handle DELETE_USER_SUCCESS', () => {
      const existingUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER'
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          role: 'CLIENT'
        }
      ];

      const currentState = {
        ...initialState,
        users: existingUsers,
        totalUsers: 2
      };

      const action = {
        type: 'DELETE_USER_SUCCESS',
        payload: 1 // userId to delete
      };

      const expectedState = {
        ...currentState,
        users: [existingUsers[1]],
        totalUsers: 1
      };

      expect(usersReducer(currentState, action)).toEqual(expectedState);
    });

    it('should handle DELETE_USER_FAILURE', () => {
      const errorMessage = 'Failed to delete user';
      const action = {
        type: 'DELETE_USER_FAILURE',
        payload: errorMessage
      };

      const expectedState = {
        ...initialState,
        error: errorMessage
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe('VERIFY_USER actions', () => {
    it('should handle VERIFY_USER_SUCCESS', () => {
      const existingUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER',
          verified: false
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          role: 'CLIENT',
          verified: true
        }
      ];

      const currentState = {
        ...initialState,
        users: existingUsers
      };

      const action = {
        type: 'VERIFY_USER_SUCCESS',
        payload: 1 // userId to verify
      };

      const expectedState = {
        ...currentState,
        users: [
          { ...existingUsers[0], verified: true },
          existingUsers[1]
        ]
      };

      expect(usersReducer(currentState, action)).toEqual(expectedState);
    });

    it('should handle VERIFY_USER_FAILURE', () => {
      const errorMessage = 'Failed to verify user';
      const action = {
        type: 'VERIFY_USER_FAILURE',
        payload: errorMessage
      };

      const expectedState = {
        ...initialState,
        error: errorMessage
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe('SEARCH_USERS actions', () => {
    it('should handle SEARCH_USERS_SUCCESS', () => {
      const searchResults = [
        {
          id: 1,
          username: 'freelancer1',
          email: 'freelancer1@example.com',
          role: 'FREELANCER'
        }
      ];

      const action = {
        type: 'SEARCH_USERS_SUCCESS',
        payload: {
          users: searchResults,
          totalUsers: 1,
          totalPages: 1,
          currentPage: 1
        }
      };

      const expectedState = {
        ...initialState,
        loading: false,
        users: searchResults,
        totalUsers: 1,
        totalPages: 1,
        currentPage: 1,
        error: null
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle SEARCH_USERS_FAILURE', () => {
      const errorMessage = 'Search failed';
      const action = {
        type: 'SEARCH_USERS_FAILURE',
        payload: errorMessage
      };

      const expectedState = {
        ...initialState,
        loading: false,
        error: errorMessage
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe('CLEAR_USERS_ERROR', () => {
    it('should clear error state', () => {
      const currentState = {
        ...initialState,
        error: 'Some error message'
      };

      const action = {
        type: 'CLEAR_USERS_ERROR'
      };

      const expectedState = {
        ...currentState,
        error: null
      };

      expect(usersReducer(currentState, action)).toEqual(expectedState);
    });
  });

  describe('RESET_USERS_STATE', () => {
    it('should reset state to initial state', () => {
      const currentState = {
        users: [{ id: 1, username: 'test' }],
        loading: true,
        error: 'Some error',
        totalUsers: 5,
        currentPage: 2,
        totalPages: 3
      };

      const action = {
        type: 'RESET_USERS_STATE'
      };

      expect(usersReducer(currentState, action)).toEqual(initialState);
    });
  });

  describe('Edge cases', () => {
    it('should handle updating non-existent user', () => {
      const existingUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER'
        }
      ];

      const updatedUser = {
        id: 999,
        username: 'nonexistent',
        email: 'nonexistent@example.com',
        role: 'CLIENT'
      };

      const currentState = {
        ...initialState,
        users: existingUsers
      };

      const action = {
        type: 'UPDATE_USER_SUCCESS',
        payload: updatedUser
      };

      // Should not modify state if user doesn't exist
      const result = usersReducer(currentState, action);
      expect(result.users).toEqual(existingUsers);
    });

    it('should handle deleting non-existent user', () => {
      const existingUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER'
        }
      ];

      const currentState = {
        ...initialState,
        users: existingUsers,
        totalUsers: 1
      };

      const action = {
        type: 'DELETE_USER_SUCCESS',
        payload: 999 // Non-existent user ID
      };

      // Should not modify state if user doesn't exist
      const result = usersReducer(currentState, action);
      expect(result.users).toEqual(existingUsers);
      expect(result.totalUsers).toBe(1);
    });

    it('should handle verifying non-existent user', () => {
      const existingUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          role: 'FREELANCER',
          verified: false
        }
      ];

      const currentState = {
        ...initialState,
        users: existingUsers
      };

      const action = {
        type: 'VERIFY_USER_SUCCESS',
        payload: 999 // Non-existent user ID
      };

      // Should not modify state if user doesn't exist
      const result = usersReducer(currentState, action);
      expect(result.users).toEqual(existingUsers);
    });

    it('should handle empty payload in FETCH_USERS_SUCCESS', () => {
      const action = {
        type: 'FETCH_USERS_SUCCESS',
        payload: {}
      };

      const expectedState = {
        ...initialState,
        loading: false,
        users: [],
        totalUsers: 0,
        totalPages: 1,
        currentPage: 1,
        error: null
      };

      expect(usersReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe('State immutability', () => {
    it('should not mutate original state', () => {
      const originalState = {
        ...initialState,
        users: [
          {
            id: 1,
            username: 'user1',
            email: 'user1@example.com',
            role: 'FREELANCER'
          }
        ]
      };

      const action = {
        type: 'ADD_USER_SUCCESS',
        payload: {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          role: 'CLIENT'
        }
      };

      const newState = usersReducer(originalState, action);

      expect(newState).not.toBe(originalState);
      expect(newState.users).not.toBe(originalState.users);
      expect(originalState.users).toHaveLength(1);
      expect(newState.users).toHaveLength(2);
    });
  });
}); 