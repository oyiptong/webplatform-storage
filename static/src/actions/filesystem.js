import * as filesize from 'filesize';
import {openEditor, editorShowPermissionError} from '../actions/files.js';

export const START_OPEN = 'START_OPEN';
export const OPEN_ENTRIES = 'OPEN_ENTRIES';
export const CLOSE_HANDLE = 'CLOSE_HANDLE';
export const REMOVE_ENTRY = 'REMOVE_ENTRY';
export const ENTRY_CHANGED = 'ENTRY_CHANGED';
export const CLOSE_ALL_HANDLES = 'CLOSE_ALL_HANDLES';

const fileExtensionRE = /(?:\.([^.]+))?$/;
const textExtensions = new Set([
  'sql',
  'cfg',
  'csv',
  'tsv',
  'go',
  'mod',
  'sum',
  'rs',
  'h',
  'cpp',
  'c',
  'cc',
  'py',
  'rb',
  'pl',
  'yaml',
  'yml',
  'toml',
  'jinja',
  'coffee',
  'js',
  'mjs',
  'jsm',
  'ts',
  'jsx',
  'tsx',
  'sh',
  'css',
  'scss',
  'less',
  'haml',
  'lock',
  'gitignore',
  'zshrc',
  'bashrc',
  'profile',
  'rst',
  'r',
  'log',
  'nfo',
  'md',
  'json',
  'txt',
  'html',
  'htm',
  'xhtml',
  'ics',
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

async function asyncEntriesFromHandle(handle,
    dispatch,
    getState,
    parent = null,
    level = 0) {
  if (!getState().filesystem.handlesOpenAllowed) {
    return;
  }
  const subHandles = [];
  const entry = {
    handle,
    file: null,
    type: 'directory',
    size: null,
    parent,
    level,
  };
  if (handle.isFile) {
    const file = await handle.getFile();
    entry.file = file;
    entry.type = deduceType(file);
    entry.size = filesize(file.size, {standard: 'iec'});
  } else {
    const subHandlesIter = await handle.getEntries();
    let itemCount = 0;
    for await (const subHandle of subHandlesIter) {
      itemCount++;
      subHandles.push(subHandle);
    }
    entry.size = `${itemCount} items`;
  }
  entry.name = handle.isFile ? handle.name : handle.name + '/';

  const entries = getState()
      .filesystem
      .entries.concat([entry]);

  dispatch({
    type: OPEN_ENTRIES,
    entries,
    lastChange: Math.floor(Date.now() / 1000),
  });
  await Promise.all(
      subHandles.map((subHandle) => asyncEntriesFromHandle(subHandle,
          dispatch,
          getState,
          handle,
          level+1)));
}

function deduceType(file) {
  if (file.type) {
    return file.type;
  }
  const nameSplit = fileExtensionRE.exec(file.name.toLowerCase());

  const ext = nameSplit[1];
  if (ext) {
    if (textExtensions.has(ext)) {
      return 'text/plain';
    }
  }

  return 'unknown';
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

export const writeFile = (entry, data) => (dispatch, getState) => {
  return async function(entry, data) {
    await writeDataToFile(entry, data, dispatch, getState);
  }(entry, data);
};

export const saveAs = (data) => (dispatch, getState) => {
  return async function(data) {
    let handle;
    try {
      handle = await window.chooseFileSystemEntries({type: 'saveFile'});
    } catch (e) {
      console.log('The user canceled the action. All is well.');
      return null;
    }
    await openHandles([handle])(dispatch, getState);

    const entry = await writeDataToFile({handle}, data, dispatch, getState);
    if (entry) {
      return openEditor(entry)(dispatch);
    }
    return null;
  }(data);
};

async function writeDataToFile(entry, data, dispatch, getState) {
  const handle = entry.handle;
  if (handle.isFile) {
    let writer;
    try {
      // May error, due to a permission prompt decline or block.
      writer = await handle.createWriter();
    } catch (e) {
      const permissionStatus = await handle.queryPermission({writable: true});
      editorShowPermissionError(e.message, permissionStatus, dispatch);
      console.log('error');
      return null;
    }
    await writer.truncate(0);
    await writer.write(0, new Blob([data]));
    if (writer.close) {
      await writer.close();
    }
    entry.file = await handle.getFile();
    entry.size = filesize(entry.file.size, {standard: 'iec'});

    if (entry) {
      dispatch({
        type: ENTRY_CHANGED,
        // Make a copy so redux knows the state has changed.
        entries: getState().filesystem.entries.concat(),
        lastChange: Math.floor(Date.now() / 1000),
      });
    }

    return entry;
  }
  return null;
}

export const closeAllHandles = (dispatch) => {
  dispatch({
    type: CLOSE_ALL_HANDLES
  });
};
