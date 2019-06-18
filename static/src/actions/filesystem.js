import * as filesize from 'filesize';

export const START_OPEN = 'START_OPEN';
export const OPEN_ENTRIES = 'OPEN_ENTRIES';
export const CLOSE_HANDLE = 'CLOSE_HANDLE';
export const REMOVE_ENTRY = 'REMOVE_ENTRY';
export const ENTRY_CHANGED = 'ENTRY_CHANGED';
export const CLOSE_ALL_HANDLES = 'CLOSE_ALL_HANDLES';

const fileExtensionRE = /(?:\.([^.]+))?$/;
const textExtensions = new Set([
  "sql",
  "cfg",
  "csv",
  "tsv",
  "go",
  "mod",
  "sum",
  "rs",
  "h",
  "cpp",
  "c",
  "cc",
  "py",
  "rb",
  "pl",
  "md",
  "nfo",
  "yaml",
  "yml",
  "toml",
  "jinja",
  "coffee",
  "js",
  "ts",
  "jsx",
  "tsx",
  "sh",
  "css",
  "scss",
  "less",
  "haml",
  "lock",
  "gitignore",
  "zshrc",
  "bashrc",
  "profile",
  "rst",
  "r",
  "log",
]);

export const openHandles = (handles) => {
  return async function(dispatch, getState) {
    dispatch({
      type: START_OPEN,
    });
    await asyncProcessHandles(handles, dispatch, getState);
  };
};

async function asyncProcessHandles(handles, dispatch, getState) {
  for (const handle of handles) {
    await asyncEntriesFromHandle(handle, dispatch, getState);
  }
}

async function asyncEntriesFromHandle(handle, dispatch, getState, parent = null, level = 0) {
  if (!getState().filesystem.handlesOpenAllowed) {
    return;
  }
  let subHandles = [];
  let entry = {
    handle,
    file: null,
    type: "directory",
    size: null,
    parent,
    level,
  };
  if (handle.isFile) {
    let file = await handle.getFile();
    entry.file = file;
    entry.type = deduceType(file);
    entry.size = filesize(file.size, {standard: "iec"});
  } else {
    let subHandlesIter = await handle.getEntries();
    let itemCount = 0;
    for await (const subHandle of subHandlesIter) {
      itemCount++;
      subHandles.push(subHandle);
    }
    entry.size = `${itemCount} items`;
  }
  entry.name = handle.isFile ? handle.name : handle.name + "/";

  dispatch({
    type: OPEN_ENTRIES,
    entries: [entry],
  });
  await Promise.all(
      subHandles.map((subHandle) => asyncEntriesFromHandle(subHandle, dispatch, getState, handle, level+1)));
}

function deduceType(file) {
  if (file.type) {
    return file.type;
  }
  let nameSplit = fileExtensionRE.exec(file.name.toLowerCase());

  let ext = nameSplit[1];
  if (ext) {
    if (textExtensions.has(ext)) {
      return "text/plain";
    }
  }

  return "unknown";
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

export const writeFile = (entry, data) => (dispatch) => {
  return async function(entry, data) {
    let handle = entry.handle;
    if (handle.isFile) {
      let writer = await handle.createWriter();
      await writer.truncate(0);
      await writer.write(0, new Blob([data]));
      entry.file = await handle.getFile();
      entry.size = filesize(entry.file.size, {standard: "iec"});

      dispatch({
        type: ENTRY_CHANGED,
        entry,
      });
    }
  }(entry, data);
};

export const closeAllHandles = (dispatch) => {
  dispatch({
    type: CLOSE_ALL_HANDLES
  });
};
