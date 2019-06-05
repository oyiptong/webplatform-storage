import { filesize } from 'filesize/lib/filesize';

export const OPEN_ENTRIES = 'OPEN_ENTRIES';
export const CLOSE_HANDLE = 'CLOSE_HANDLE';
export const REMOVE_ENTRY = 'REMOVE_ENTRY';
export const WRITE_FILE = 'WRITE_FILE';
export const CLOSE_ALL_HANDLES = 'CLOSE_ALL_HANDLES';

export const openHandles = (handles) => {
  return async function(dispatch) {
    let entries = await asyncProcessHandles(handles);
    dispatch({
      type: OPEN_ENTRIES,
      entries,
    });
  };
};

async function asyncProcessHandles(handles) {
  let entries = [];
  for (const handle of handles) {
    await asyncEntriesFromHandle(handle, entries);
  }
  return entries;
}

async function asyncEntriesFromHandle(handle, entries) {
  let entry = {
    handle,
    file: null,
    mimetype: null,
    size: null,
  };
  if (handle.isFile) {
    let file = await handle.getFile();
    entry.file = file;
    entry.mimetype = file.type || "unknown";
    //entry.size = filesize(file.size, {standard: "iec"});
    entry.size = file.size;
  } else {
    let subHandles = await handle.getEntries();
    for await (const subHandle of subHandles) {
      await asyncEntriesFromHandle(subHandle, entries);
    }
  }
  entry.name = handle.isFile ? handle.name : handle.name + "/";

  entries.push(entry);
}

export const closeHandle = (handle) => (dispatch) => {
  dispatch({
    type: CLOSE_HANDLE,
    handle,
  });
};

export const removeEntry = (handle, name) => (dispatch) => {
  dispatch({
    type: REMOVE_ENTRY,
    handle,
    name,
  });
};

export const writeFile = (handle, data) => (dispatch) => {
  dispatch({
    type: WRITE_FILE,
    handle,
    data,
  });
};

export const closeAllHandles = (dispatch) => {
  dispatch({
    type: CLOSE_ALL_HANDLES
  });
};
