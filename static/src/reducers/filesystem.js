import { START_OPEN, OPEN_ENTRIES, CLOSE_HANDLE, CLOSE_ALL_HANDLES, REMOVE_ENTRY, WRITE_FILE } from '../actions/filesystem.js';
const defaultState = {
  entries: [],
  handlesOpenAllowed: true,
};

const filesystem = (state = defaultState, action) => {
  switch(action.type) {
  case START_OPEN:
    return {
      ...state,
      handlesOpenAllowed: true,
    };
  case OPEN_ENTRIES:
    let newState = state;
    if (state.handlesOpenAllowed) {
      let entries = state.entries.concat(action.entries);
      newState = {
        ...state,
        entries,
      };
    }
    return newState;
  case CLOSE_ALL_HANDLES:
    return {
      ...state,
      handlesOpenAllowed: false,
      entries: [],
    };
  default:
    return state;
  }
};

export default filesystem;
