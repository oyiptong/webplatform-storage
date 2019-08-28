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
    // If handlesOpenAllowed is false, it effectively ignores ongoing handlesOpenAllowed actions.
      // A poor person's cancel, if you will.
      if (state.handlesOpenAllowed) {
        return {
          ...state,
          entries: action.entries,
          lastChange: action.lastChange,
        };
      }
    case CLOSE_ALL_HANDLES:
      return {
        ...state,
        handlesOpenAllowed: false,
        entries: [],
      };
    case ENTRY_CHANGED:
      return {
        ...state,
        entries: action.entries,
        lastChange: action.lastChange,
      };
    default:
      return state;
  }
};

export default filesystem;
