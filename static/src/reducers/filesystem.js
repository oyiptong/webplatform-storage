import { OPEN_ENTRIES, CLOSE_HANDLE, CLOSE_ALL_HANDLES, REMOVE_ENTRY, WRITE_FILE } from '../actions/filesystem.js';
const defaultState = {
  entries: [],
};

const filesystem = (state = defaultState, action) => {
  switch(action.type) {
  case OPEN_ENTRIES:
    let entries = state.entries.concat(action.entries);
    return {
      ...state,
      entries,
    };
  case CLOSE_ALL_HANDLES:
    return {
      ...state,
      entries: [],
    };
  default:
    return state;
  }
};

export default filesystem;
