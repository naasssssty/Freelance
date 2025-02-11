//usersReducer.jsx

const initialState = {
    usersList: [],
    loading: false,
    error: null,
};

const usersReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USERS_LIST':
            return {
                ...state,
                usersList: action.payload,
            };
        default:
            return state;
    }
};

export default usersReducer;
