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
  return async function(entry, dispatch) {
    let file = entry.file;
    let fileData = await new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onabort = (e) => {
        resolve("");
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsText(file);
    });

    dispatch({
      type: OPEN_EDITOR,
      entry,
      fileData,
    });
  }(entry, dispatch);
};

export const closeEditor = (dispatch) => {
  dispatch({
    type: CLOSE_EDITOR,
  });
};
