import {
  START_OPEN,
  OPEN_ENTRIES,
  CLOSE_ALL_HANDLES,
  ENTRY_CHANGED
} from '../actions/filesystem.js';

const defaultState = {
  entries: [],
  lastChange: null,
  handlesOpenAllowed: true,
};

const filesystem = (state = defaultState, action) => {
  switch (action.type) {
    case START_OPEN:
      return {
        ...state,
        handlesOpenAllowed: true,
      };
    case OPEN_ENTRIES:
      let newState = state;
      if (state.handlesOpenAllowed) {
        const entries = state.entries.concat(action.entries);

        newState = {
          ...state,
          entries,
          lastChange: Math.floor(Date.now() / 1000),
        };
      }
      return newState;
    case CLOSE_ALL_HANDLES:
      return {
        ...state,
        handlesOpenAllowed: false,
        entries: [],
      };
    case ENTRY_CHANGED:
      return {
        ...state,
        lastChange: Math.floor(Date.now() / 1000),
      };
    default:
      return state;
  }
};

export default filesystem;
