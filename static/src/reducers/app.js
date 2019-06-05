import { UPDATE_PAGE } from '../actions/app.js';

const defaultState = {
  page: 'home',
  featuresEnabled: new Set(['nativefs']),
};

const app = (state = defaultState, action) => {
  switch(action.type) {
  case UPDATE_PAGE:
    console.log("update page action: " + action.page);
    return {
      ...state,
      page: action.page,
    };
  default:
    return state;
  }
};

export default app;
