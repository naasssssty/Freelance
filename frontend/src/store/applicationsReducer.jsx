//applicationsReducer.jsx

const initialState = {
    myFAplications: [],
    myApplications: [],     // List of applications made by the user
    loading: false,         // Tracks loading state
    error: null            // Tracks error state
}

const applicationsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_MY_APPLICATIONS':
            return {
                ...state,
                myApplications: action.payload,
            };
        case 'SET_MY_APPLICATIONS_F':
            return {
                ...state,
                myFApplications: action.payload,
            };
        default:
            return state;
    }
};

export default applicationsReducer;
