import { OPEN_ENTRIES, CLOSE_HANDLE, REMOVE_ENTRY, WRITE_FILE } from '../actions/filesystem.js';
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
  default:
    return state;
  }
};

export default filesystem;
