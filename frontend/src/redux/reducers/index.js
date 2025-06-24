import { combineReducers } from 'redux';
// Import other reducers
import adminReducer from './adminReducer';

const rootReducer = combineReducers({
  // Other reducers
  admin: adminReducer
});

export default rootReducer; 