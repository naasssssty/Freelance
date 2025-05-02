const initialState = {
    user: null,
    username: localStorage.getItem('username') || '',
    isAuthenticated: false,
    error: null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                username: action.payload.username,
                isAuthenticated: true,
                error: null
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                username: '',
                isAuthenticated: false
            };
        default:
            return state;
    }
};

export default authReducer; 