import projectsReducer from '../projectsReducer';

describe('projectsReducer', () => {
  const initialState = {
    projects: [],
    loading: false,
    error: null,
    searchResults: []
  };

  it('should return initial state', () => {
    expect(projectsReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle FETCH_PROJECTS_START', () => {
    const action = { type: 'FETCH_PROJECTS_START' };
    const expectedState = {
      ...initialState,
      loading: true,
      error: null
    };

    expect(projectsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_PROJECTS_SUCCESS', () => {
    const projects = [
      {
        id: 1,
        title: 'Test Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'PENDING'
      },
      {
        id: 2,
        title: 'Test Project 2',
        description: 'Description 2',
        budget: 2000,
        projectStatus: 'APPROVED'
      }
    ];
    
    const action = {
      type: 'FETCH_PROJECTS_SUCCESS',
      payload: projects
    };
    
    const expectedState = {
      ...initialState,
      projects,
      loading: false,
      error: null
    };

    expect(projectsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle FETCH_PROJECTS_FAILURE', () => {
    const error = 'Failed to fetch projects';
    const action = {
      type: 'FETCH_PROJECTS_FAILURE',
      payload: error
    };
    
    const expectedState = {
      ...initialState,
      loading: false,
      error,
      projects: []
    };

    expect(projectsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_PROJECT', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Existing Project',
        description: 'Description',
        budget: 1000,
        projectStatus: 'PENDING'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const newProject = {
      id: 2,
      title: 'New Project',
      description: 'New Description',
      budget: 1500,
      projectStatus: 'PENDING'
    };
    
    const action = {
      type: 'ADD_PROJECT',
      payload: newProject
    };
    
    const expectedState = {
      ...currentState,
      projects: [...existingProjects, newProject]
    };

    expect(projectsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_PROJECT', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'PENDING'
      },
      {
        id: 2,
        title: 'Project 2',
        description: 'Description 2',
        budget: 2000,
        projectStatus: 'APPROVED'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const updatedProject = {
      id: 1,
      title: 'Updated Project 1',
      description: 'Updated Description 1',
      budget: 1200,
      projectStatus: 'APPROVED'
    };
    
    const action = {
      type: 'UPDATE_PROJECT',
      payload: updatedProject
    };
    
    const expectedState = {
      ...currentState,
      projects: [
        updatedProject,
        existingProjects[1]
      ]
    };

    expect(projectsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle DELETE_PROJECT', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'PENDING'
      },
      {
        id: 2,
        title: 'Project 2',
        description: 'Description 2',
        budget: 2000,
        projectStatus: 'APPROVED'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const action = {
      type: 'DELETE_PROJECT',
      payload: 1
    };
    
    const expectedState = {
      ...currentState,
      projects: [existingProjects[1]]
    };

    expect(projectsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle APPROVE_PROJECT', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'PENDING'
      },
      {
        id: 2,
        title: 'Project 2',
        description: 'Description 2',
        budget: 2000,
        projectStatus: 'PENDING'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const action = {
      type: 'APPROVE_PROJECT',
      payload: 1
    };
    
    const expectedState = {
      ...currentState,
      projects: [
        {
          ...existingProjects[0],
          projectStatus: 'APPROVED'
        },
        existingProjects[1]
      ]
    };

    expect(projectsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle DENY_PROJECT', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'PENDING'
      },
      {
        id: 2,
        title: 'Project 2',
        description: 'Description 2',
        budget: 2000,
        projectStatus: 'PENDING'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const action = {
      type: 'DENY_PROJECT',
      payload: 1
    };
    
    const expectedState = {
      ...currentState,
      projects: [
        {
          ...existingProjects[0],
          projectStatus: 'DENIED'
        },
        existingProjects[1]
      ]
    };

    expect(projectsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle SEARCH_PROJECTS_SUCCESS', () => {
    const searchResults = [
      {
        id: 1,
        title: 'Search Result 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'APPROVED'
      }
    ];
    
    const action = {
      type: 'SEARCH_PROJECTS_SUCCESS',
      payload: searchResults
    };
    
    const expectedState = {
      ...initialState,
      searchResults,
      loading: false,
      error: null
    };

    expect(projectsReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_SEARCH_RESULTS', () => {
    const currentState = {
      ...initialState,
      searchResults: [
        {
          id: 1,
          title: 'Search Result 1',
          description: 'Description 1',
          budget: 1000,
          projectStatus: 'APPROVED'
        }
      ]
    };

    const action = { type: 'CLEAR_SEARCH_RESULTS' };
    
    const expectedState = {
      ...currentState,
      searchResults: []
    };

    expect(projectsReducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle COMPLETE_PROJECT', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'IN_PROGRESS'
      },
      {
        id: 2,
        title: 'Project 2',
        description: 'Description 2',
        budget: 2000,
        projectStatus: 'APPROVED'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const action = {
      type: 'COMPLETE_PROJECT',
      payload: 1
    };
    
    const expectedState = {
      ...currentState,
      projects: [
        {
          ...existingProjects[0],
          projectStatus: 'COMPLETED'
        },
        existingProjects[1]
      ]
    };

    expect(projectsReducer(currentState, action)).toEqual(expectedState);
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

    expect(projectsReducer(stateWithError, action)).toEqual(expectedState);
  });

  it('should not mutate original state', () => {
    const originalState = {
      projects: [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          budget: 1000,
          projectStatus: 'PENDING'
        }
      ],
      loading: false,
      error: null,
      searchResults: []
    };
    
    const action = {
      type: 'UPDATE_PROJECT',
      payload: {
        id: 1,
        title: 'Updated Project 1',
        description: 'Updated Description 1',
        budget: 1200,
        projectStatus: 'APPROVED'
      }
    };
    
    const newState = projectsReducer(originalState, action);
    
    // Original state should not be modified
    expect(originalState.projects[0].title).toBe('Project 1');
    expect(originalState.projects[0].projectStatus).toBe('PENDING');
    
    // New state should be different
    expect(newState.projects[0].title).toBe('Updated Project 1');
    expect(newState.projects[0].projectStatus).toBe('APPROVED');
    expect(newState).not.toBe(originalState);
  });

  it('should handle unknown action types', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    
    expect(projectsReducer(initialState, action)).toEqual(initialState);
  });

  it('should preserve state for unknown actions', () => {
    const currentState = {
      projects: [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          budget: 1000,
          projectStatus: 'PENDING'
        }
      ],
      loading: false,
      error: null,
      searchResults: []
    };
    
    const action = { type: 'UNKNOWN_ACTION' };
    
    expect(projectsReducer(currentState, action)).toEqual(currentState);
  });

  it('should handle UPDATE_PROJECT when project does not exist', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'PENDING'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const updatedProject = {
      id: 999, // Non-existent ID
      title: 'Non-existent Project',
      description: 'Description',
      budget: 1200,
      projectStatus: 'APPROVED'
    };
    
    const action = {
      type: 'UPDATE_PROJECT',
      payload: updatedProject
    };
    
    // Should return state unchanged if project doesn't exist
    expect(projectsReducer(currentState, action)).toEqual(currentState);
  });

  it('should handle DELETE_PROJECT when project does not exist', () => {
    const existingProjects = [
      {
        id: 1,
        title: 'Project 1',
        description: 'Description 1',
        budget: 1000,
        projectStatus: 'PENDING'
      }
    ];

    const currentState = {
      ...initialState,
      projects: existingProjects
    };

    const action = {
      type: 'DELETE_PROJECT',
      payload: 999 // Non-existent ID
    };
    
    // Should return state unchanged if project doesn't exist
    expect(projectsReducer(currentState, action)).toEqual(currentState);
  });
}); 