//projectsReducer.jsx

const initialState = {
    projectsList: [],       // List of all projects
    availableProjects: [],  // List of available projects (specific to the FreelancerDashboard)
    loading: false,         // Tracks loading state
    error: null,            // Tracks error state
    myProjects: [],
    myFProjects: [],
};

const projectsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_PROJECTS_LIST':
            return {
                ...state,
                projectsList: action.payload,
            };
        case 'SET_AVAILABLE_PROJECTS':
            return {
                ...state,
                availableProjects: action.payload,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };
        case 'SET_MY_PROJECTS':
            return {
                ...state,
                myProjects: action.payload,
            };
        case 'SET_MY_FPROJECTS':
            return {
                ...state,
                myFProjects: action.payload,
            };
        default:
            return state;
    }
};

export default projectsReducer;
