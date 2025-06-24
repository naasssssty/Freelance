const initialState = {
  usersList: [],
  projectsList: [],
  usersLoading: false,
  usersError: null,
  projectsLoading: false,
  projectsError: null
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USERS_LIST":
      return {
        ...state,
        usersList: action.payload,
        usersLoading: false
      };
    case "SET_PROJECTS_LIST":
      return {
        ...state,
        projectsList: action.payload,
        projectsLoading: false
      };
    case "USERS_LOADING":
      return {
        ...state,
        usersLoading: true,
        usersError: null
      };
    case "PROJECTS_LOADING":
      return {
        ...state,
        projectsLoading: true,
        projectsError: null
      };
    case "USERS_ERROR":
      return {
        ...state,
        usersLoading: false,
        usersError: action.payload
      };
    case "PROJECTS_ERROR":
      return {
        ...state,
        projectsLoading: false,
        projectsError: action.payload
      };
    default:
      return state;
  }
};

export default adminReducer; 