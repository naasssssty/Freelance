import applicationsReducer from '../applicationsReducer';

describe('applicationsReducer', () => {
  const initialState = {
    applications: [],
    loading: false,
    error: null,
    myApplications: []
  };

  it('should return initial state', () => {
    expect(applicationsReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_APPLICATIONS_START', () => {
    const action = { type: 'FETCH_APPLICATIONS_START' };
    const expectedState = {
      ...initialState,
      loading: true,
      error: null
    };

    expect(applicationsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_APPLICATIONS_SUCCESS', () => {
    const applications = [
      {
        id: 1,
        projectTitle: 'Test Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'I am interested in this project'
      },
      {
        id: 2,
        projectTitle: 'Test Project 2',
        freelancer: 'freelancer2',
        applicationStatus: 'APPROVED',
        cover_letter: 'Please consider my application'
      }
    ];
    
    const action = {
      type: 'FETCH_APPLICATIONS_SUCCESS',
      payload: applications
    };
    
    const expectedState = {
      ...initialState,
      applications,
      loading: false,
      error: null
    };

    expect(applicationsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_APPLICATIONS_FAILURE', () => {
    const error = 'Failed to fetch applications';
    const action = {
      type: 'FETCH_APPLICATIONS_FAILURE',
      payload: error
    };
    
    const expectedState = {
      ...initialState,
      loading: false,
      error,
      applications: []
    };

    expect(applicationsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_APPLICATION', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Existing Project',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Existing application'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const newApplication = {
      id: 2,
      projectTitle: 'New Project',
      freelancer: 'freelancer2',
      applicationStatus: 'WAITING',
      cover_letter: 'New application'
    };
    
    const action = {
      type: 'ADD_APPLICATION',
      payload: newApplication
    };
    
    const expectedState = {
      ...currentState,
      applications: [...existingApplications, newApplication]
    };

    expect(applicationsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_APPLICATION', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Original letter'
      },
      {
        id: 2,
        projectTitle: 'Project 2',
        freelancer: 'freelancer2',
        applicationStatus: 'WAITING',
        cover_letter: 'Another letter'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const updatedApplication = {
      id: 1,
      projectTitle: 'Project 1',
      freelancer: 'freelancer1',
      applicationStatus: 'APPROVED',
      cover_letter: 'Updated letter'
    };
    
    const action = {
      type: 'UPDATE_APPLICATION',
      payload: updatedApplication
    };
    
    const expectedState = {
      ...currentState,
      applications: [
        updatedApplication,
        existingApplications[1]
      ]
    };

    expect(applicationsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle DELETE_APPLICATION', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      },
      {
        id: 2,
        projectTitle: 'Project 2',
        freelancer: 'freelancer2',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 2'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const action = {
      type: 'DELETE_APPLICATION',
      payload: 1
    };
    
    const expectedState = {
      ...currentState,
      applications: [existingApplications[1]]
    };

    expect(applicationsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle APPROVE_APPLICATION', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      },
      {
        id: 2,
        projectTitle: 'Project 2',
        freelancer: 'freelancer2',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 2'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const action = {
      type: 'APPROVE_APPLICATION',
      payload: 1
    };
    
    const expectedState = {
      ...currentState,
      applications: [
        {
          ...existingApplications[0],
          applicationStatus: 'APPROVED'
        },
        existingApplications[1]
      ]
    };

    expect(applicationsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REJECT_APPLICATION', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      },
      {
        id: 2,
        projectTitle: 'Project 2',
        freelancer: 'freelancer2',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 2'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const action = {
      type: 'REJECT_APPLICATION',
      payload: 1
    };
    
    const expectedState = {
      ...currentState,
      applications: [
        {
          ...existingApplications[0],
          applicationStatus: 'REJECTED'
        },
        existingApplications[1]
      ]
    };

    expect(applicationsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_MY_APPLICATIONS_SUCCESS', () => {
    const myApplications = [
      {
        id: 1,
        projectTitle: 'My Application 1',
        freelancer: 'currentuser',
        applicationStatus: 'WAITING',
        cover_letter: 'My letter 1'
      },
      {
        id: 2,
        projectTitle: 'My Application 2',
        freelancer: 'currentuser',
        applicationStatus: 'APPROVED',
        cover_letter: 'My letter 2'
      }
    ];
    
    const action = {
      type: 'FETCH_MY_APPLICATIONS_SUCCESS',
      payload: myApplications
    };
    
    const expectedState = {
      ...initialState,
      myApplications,
      loading: false,
      error: null
    };

    expect(applicationsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_MY_APPLICATIONS', () => {
    const currentState = {
      ...initialState,
      myApplications: [
        {
          id: 1,
          projectTitle: 'My Application 1',
          freelancer: 'currentuser',
          applicationStatus: 'WAITING',
          cover_letter: 'My letter 1'
        }
      ]
    };

    const action = { type: 'CLEAR_MY_APPLICATIONS' };
    
    const expectedState = {
      ...currentState,
      myApplications: []
    };

    expect(applicationsReducer(currentState, action)).toEqual(expectedState);
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

    expect(applicationsReducer(stateWithError, action)).toEqual(expectedState);
  });

  it('should handle SET_LOADING', () => {
    const action = {
      type: 'SET_LOADING',
      payload: true
    };
    
    const expectedState = {
      ...initialState,
      loading: true
    };

    expect(applicationsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should not mutate original state', () => {
    const originalState = {
      applications: [
        {
          id: 1,
          projectTitle: 'Project 1',
          freelancer: 'freelancer1',
          applicationStatus: 'WAITING',
          cover_letter: 'Original letter'
        }
      ],
      loading: false,
      error: null,
      myApplications: []
    };
    
    const action = {
      type: 'UPDATE_APPLICATION',
      payload: {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'APPROVED',
        cover_letter: 'Updated letter'
      }
    };
    
    const newState = applicationsReducer(originalState, action);
    
    // Original state should not be modified
    expect(originalState.applications[0].applicationStatus).toBe('WAITING');
    expect(originalState.applications[0].cover_letter).toBe('Original letter');
    
    // New state should be different
    expect(newState.applications[0].applicationStatus).toBe('APPROVED');
    expect(newState.applications[0].cover_letter).toBe('Updated letter');
    expect(newState).not.toBe(originalState);
  });

  it('should handle unknown action types', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    
    expect(applicationsReducer(initialState, action)).toEqual(initialState);
  });

  it('should preserve state for unknown actions', () => {
    const currentState = {
      applications: [
        {
          id: 1,
          projectTitle: 'Project 1',
          freelancer: 'freelancer1',
          applicationStatus: 'WAITING',
          cover_letter: 'Letter 1'
        }
      ],
      loading: false,
      error: null,
      myApplications: []
    };
    
    const action = { type: 'UNKNOWN_ACTION' };
    
    expect(applicationsReducer(currentState, action)).toEqual(currentState);
  });

  it('should handle UPDATE_APPLICATION when application does not exist', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const updatedApplication = {
      id: 999, // Non-existent ID
      projectTitle: 'Non-existent Project',
      freelancer: 'freelancer999',
      applicationStatus: 'APPROVED',
      cover_letter: 'Non-existent letter'
    };
    
    const action = {
      type: 'UPDATE_APPLICATION',
      payload: updatedApplication
    };
    
    // Should return state unchanged if application doesn't exist
    expect(applicationsReducer(currentState, action)).toEqual(currentState);
  });

  it('should handle DELETE_APPLICATION when application does not exist', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const action = {
      type: 'DELETE_APPLICATION',
      payload: 999 // Non-existent ID
    };
    
    // Should return state unchanged if application doesn't exist
    expect(applicationsReducer(currentState, action)).toEqual(currentState);
  });

  it('should handle APPROVE_APPLICATION when application does not exist', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const action = {
      type: 'APPROVE_APPLICATION',
      payload: 999 // Non-existent ID
    };
    
    // Should return state unchanged if application doesn't exist
    expect(applicationsReducer(currentState, action)).toEqual(currentState);
  });

  it('should handle REJECT_APPLICATION when application does not exist', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      }
    ];

    const currentState = {
      ...initialState,
      applications: existingApplications
    };

    const action = {
      type: 'REJECT_APPLICATION',
      payload: 999 // Non-existent ID
    };
    
    // Should return state unchanged if application doesn't exist
    expect(applicationsReducer(currentState, action)).toEqual(currentState);
  });

  it('should handle multiple applications with same status changes', () => {
    const existingApplications = [
      {
        id: 1,
        projectTitle: 'Project 1',
        freelancer: 'freelancer1',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 1'
      },
      {
        id: 2,
        projectTitle: 'Project 2',
        freelancer: 'freelancer2',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 2'
      },
      {
        id: 3,
        projectTitle: 'Project 3',
        freelancer: 'freelancer3',
        applicationStatus: 'WAITING',
        cover_letter: 'Letter 3'
      }
    ];

    let currentState = {
      ...initialState,
      applications: existingApplications
    };

    // Approve first application
    let action = {
      type: 'APPROVE_APPLICATION',
      payload: 1
    };
    currentState = applicationsReducer(currentState, action);

    // Reject second application
    action = {
      type: 'REJECT_APPLICATION',
      payload: 2
    };
    currentState = applicationsReducer(currentState, action);

    expect(currentState.applications[0].applicationStatus).toBe('APPROVED');
    expect(currentState.applications[1].applicationStatus).toBe('REJECTED');
    expect(currentState.applications[2].applicationStatus).toBe('WAITING');
  });
}); 