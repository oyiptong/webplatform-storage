export const OPEN_VIEWER = 'OPEN_VIEWER';
export const CLOSE_VIEWER = 'CLOSE_VIEWER';
export const OPEN_EDITOR = 'OPEN_EDITOR';
export const CLOSE_EDITOR = 'CLOSE_EDITOR';

export const openViewer = (entry) => (dispatch) => {
  return async function(entry, dispatch) {
    // File may have changed.
    entry.file = await entry.handle.getFile();
    const objectURL = URL.createObjectURL(entry.file);
    dispatch({
      type: OPEN_VIEWER,
      entry,
      objectURL,
    });
  }(entry, dispatch);
};

export const closeViewer = (dispatch) => {
  dispatch({
    type: CLOSE_VIEWER,
  });
};

export const openEditor = (entry) => (dispatch) => {
  return async function(entry, dispatch) {
    let fileData;

    if (entry && !entry.isEmpty) {
      // File may have changed.
      entry.file = await entry.handle.getFile();
      fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.onabort = (e) => {
          resolve('');
        };
        reader.onerror = (e) => {
          reject(e);
        };
        reader.readAsText(entry.file);
      });
    }

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
