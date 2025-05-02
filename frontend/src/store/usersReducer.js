const initialState = {
    usersList: [],
    loading: false,
    error: null
};

const usersReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_USERS_LIST":
            return {
                ...state,
                usersList: action.payload,
                loading: false,
                error: null
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: true
            };
        case "SET_ERROR":
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};

export default usersReducer; 