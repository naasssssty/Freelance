//store.jsx

import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './usersReducer';
import projectsReducer from './projectsReducer';
import applicationsReducer from "./applicationsReducer"; // Προσθήκη import

export const store = configureStore({
    reducer: {
        users: usersReducer,
        projects: projectsReducer,
        applications: applicationsReducer
    },
});