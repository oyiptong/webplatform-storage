import {UPDATE_PAGE, TOGGLE_DEBUG_MODE} from '../actions/app.js';

const defaultState = {
  page: 'home',
  featuresEnabled: new Set(['nativefs']),
  debug: window.localStorage.getItem('debug') ? true : false,
};

const app = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_PAGE:
      return {
        ...state,
        page: action.page,
      };
    case TOGGLE_DEBUG_MODE:
      return {
        ...state,
        debug: action.debug,
      };
    default:
      return state;
  }
};

export default app;
