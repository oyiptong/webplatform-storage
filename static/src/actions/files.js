export const OPEN_VIEWER = 'OPEN_VIEWER';
export const CLOSE_VIEWER = 'CLOSE_VIEWER';
export const OPEN_EDITOR = 'OPEN_EDITOR';
export const CLOSE_EDITOR = 'CLOSE_EDITOR';

export const openViewer = (entry) => (dispatch) => {
  dispatch({
    type: OPEN_VIEWER,
    entry,
  });
};

export const closeViewer = (dispatch) => {
  dispatch({
    type: CLOSE_VIEWER,
  });
};

export const openEditor = (entry) => (dispatch) => {
  dispatch({
    type: OPEN_EDITOR,
    entry,
  });
};

export const closeEditor = (dispatch) => {
  dispatch({
    type: CLOSE_EDITOR,
  });
};
