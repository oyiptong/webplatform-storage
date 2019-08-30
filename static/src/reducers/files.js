import {
  OPEN_VIEWER,
  CLOSE_VIEWER,
  OPEN_EDITOR,
  CLOSE_EDITOR,
  SHOW_ERROR_EDITOR,
  CLOSE_ERROR_EDITOR,
} from '../actions/files.js';

const defaultState = {
  viewerEntry: null,
  permissionError: null,
};

const files = (state = defaultState, action) => {
  switch (action.type) {
    case OPEN_VIEWER:
      return {
        ...state,
        viewerEntry: action.entry,
        viewerObjectURL: action.objectURL,
      };
    case CLOSE_VIEWER:
      return {
        ...state,
        viewerEntry: null,
      };
    case OPEN_EDITOR:
      return {
        ...state,
        editorEntry: action.entry,
        editorFileData: action.fileData,
      };
    case CLOSE_EDITOR:
      return {
        ...state,
        editorEntry: null,
        editorFileData: null,
      };
    case SHOW_ERROR_EDITOR:
      return {
        ...state,
        errorToPrompt: action.errorToPrompt,
      };
    case CLOSE_ERROR_EDITOR:
      return {
        ...state,
        errorToPrompt: null,
      };
    default:
      return {
        ...state,
      };
      return state;
  }
};

export default files;
