import {
  UPDATE_PAGE,
  TOGGLE_DEBUG_MODE,
  SHOW_ERROR_PROMPT,
  CLOSE_ERROR_PROMPT,
} from '../actions/app.js';

import Dexie from 'dexie';

const db = new Dexie('entrydb');
db.version(1).stores({
  entries: '++id, name, type, size, handle'
});

const defaultState = {
  page: 'home',
  featuresEnabled: new Set(['nativefs', 'indexeddb', 'filehandling']),
  debug: window.localStorage.getItem('debug') ? true : false,
  errorToPrompt: null,
  db: db,
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
    case SHOW_ERROR_PROMPT:
      return {
        ...state,
        errorToPrompt: action.errorToPrompt,
      };
    case CLOSE_ERROR_PROMPT:
      return {
        ...state,
        errorToPrompt: null,
      };
    default:
      return state;
  }
};

export default app;
