import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './usersReducer';
import projectsReducer from './projectsReducer';
import applicationsReducer from "./applicationsReducer";
import authReducer from './authReducer';
import adminReducer from '../redux/reducers/adminReducer';

// Συνδυάζουμε όλους τους reducers σε ένα store
export const store = configureStore({
    reducer: {
        users: usersReducer,
        projects: projectsReducer,
        applications: applicationsReducer,
        auth: authReducer,
        admin: adminReducer
    },
    // Το middleware thunk περιλαμβάνεται αυτόματα στο configureStore
}); 