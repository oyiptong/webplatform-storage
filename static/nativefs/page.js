"use strict";

const entriesTableName = "entries";
const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

let eventListElem;
let dirInputElem;
let fileInputElem;
let fileHandleCountElem;
let dirHandleCountElem;
let filesListElem;
let resultsListElem;
let entries = [];
let openFileCount = 0;
let openDirCount = 0;
let db;

function initHandleStatus() {
  fileHandleCountElem.innerText = "0";
  dirHandleCountElem.innerText = "0";
  openFileCount = 0;
  openDirCount = 0;
}

function updateHandleStatus(opts) {
  if (opts.files) {
    openFileCount += opts.files;
    fileHandleCountElem.innerText = `${openFileCount}`;
  }
  if (opts.directories) {
    openDirCount += opts.directories;
    dirHandleCountElem.innerText = `${openDirCount}`;
  }
}

function getStore() {
  return db.transaction([entriesTableName]).objectStore(entriesTableName);
}

function promiseAddEntry(entry) {
  return new Promise((resolve, reject) => {
    let transaction = db.transaction([entriesTableName], "readwrite");
    let store = transaction.objectStore(entriesTableName);
    let req = store.add(entry);
    req.onsuccess = () => {
      addLogEvent(`IndexedDB: Successfully added ${entry.name}`);
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject();
    };
  });
}

function promiseGetEntryByName(name) {
  return new Promise((resolve, reject) => {
    let store = getStore();
    let req = store.get(name);
    req.onsuccess = () => {
      resolve(req.result);
    };
    req.onerror = () => {
      reject(req);
    };
  });
}

function promiseGetAllEntries() {
  return new Promise((resolve, reject) => {
    let store = getStore();
    let req = store.getAll();
    req.onsuccess = () => {
      resolve(req.result);
    };
    req.onerror = () => {
      reject(req);
    };
  });
}

function setAPIStatus() {
  let statusFSElem = document.querySelector("#status-nativefs");
  let statusIDBElem = document.querySelector("#status-indexeddb");
  if (window.chooseFileSystemEntries) {
    statusFSElem.innerText = "OK";
    statusFSElem.className = "text-success";
  } else {
    statusFSElem.innerText = "API not available";
    statusFSElem.className = "text-danger";
  }

  if (window.indexedDB) {
    statusIDBElem.innerText = "OK";
    statusIDBElem.className = "text-success";
  } else {
    statusIDBElem.innerText = "API not available";
    statusIDBElem.className = "text-danger";
  }
}

function clearFilesList(elem) {
  entries = [];
  return clearChildren(elem);
}

function clearChildren(elem) {
  return function() {
    let count = 0;
    while(elem.firstElementChild) {
      count++;
      elem.firstElementChild.remove();
    }
    addLogEvent(`Cleared ${count} elements`);
  };
}

function createElemsForEntry(entry) {
  let rowElem = document.createElement("tr");
  let labelElem = document.createElement("td");
  let typeElem = document.createElement("td");
  let sizeElem = document.createElement("td");
  let actionsElem = document.createElement("td");

  labelElem.innerText = entry.name;
  typeElem.innerText = entry.type;
  sizeElem.innerText = entry.size;

  let buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group");

  let buttons = [];

  if (entry.handle.isFile) {
    let readButton = document.createElement("button");
    readButton.innerText = "Read";
    readButton.classList.add("btn", "btn-info");
    readButton.addEventListener('click', handleFileClick(entry));
    buttons.push(readButton);
  }

  let deleteButton = document.createElement("button");
  deleteButton.innerText = "Remove";
  deleteButton.classList.add("btn", "btn-danger");
  buttons.push(deleteButton);


  buttonGroup.append(...buttons);
  actionsElem.append(buttonGroup);

  rowElem.append(labelElem, typeElem, sizeElem, actionsElem);
  filesListElem.append(rowElem);
}

async function createFileTableEntry(handle) {
  let handleType = handle.isFile ? "file": "directory";
  let entry = {
    name: handle.name,
    handle: handle,
    size: "N/A",
    type: handleType,
  };

  if (handle.isFile) {
    let file = await handle.getFile();
    let fileType = file.type;
    entry.size = file.size;
    if (!file.type) {
      fileType = "unknown";
    }
    entry.type = `${entry.type}: ${fileType}`;
    updateHandleStatus({files: 1});
  } else {
    let subEntries = await handle.getEntries();
    for await (const subHandle of subEntries) {
      await createFileTableEntry(subHandle);
    }
    updateHandleStatus({directories: 1});
  }
  try {
    let item = await promiseGetEntryByName(entry.name);
    if (!item) {
      await promiseAddEntry(entry);
    }
  } catch(e) {
    addLogEvent(`IndexedDB feature failed: ${e}`);
  }
  entries.push(entry);
  addLogEvent(`Processing Entry: ${entry.name}, is_a: ${entry.type}`);
  createElemsForEntry(entry);

  return entry;
}

function handleFileClick(entry) {
  return async () => {
    let handle = entry.handle;
    if (handle.isFile) {
      let file = await handle.getFile();
      if (!file.type || file.type == "application/json" || file.type == "text/plain") {
        let reader = emojiReaderForFile(file);
        reader.readAsText(file);
      addLogEvent(`Read event for ${entry.name}`);
      } else if (file.type.startsWith("image/")) {
        let dataURL = URL.createObjectURL(file);
        let imgElem;

        if (file.type == "image/svg+xml") {
          try {
            let bitmap = await createImageBitmap(file);
          } catch(e) {
            addLogEvent(`ERROR: Cannot load ${file.name}: ${e}`);
            throw e;
          }
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('bitmaprenderer');
          ctx.transferFromImageBitmap(bitmap);
          dataURL = canvas.toDataURL();
          imgElem = document.createElement("img");
          imgElem.src = canvas.toDataURL();
        } else {
          imgElem = document.createElement("img");
          imgElem.src = dataURL;
        }
        imgElem.classList.add("img-preview");

        let divElem = document.createElement("div");
        divElem.innerText = "Image file loaded. Preview:";
        divElem.append(imgElem);

        addResult(divElem);
      } else {
        addLogEvent(`No handler for ${file.name} of type ${file.type}`);
      }
    } else {
      addLogEvent(`Cannot handle Read event for ${entry.name}:${entry.type}`);
    }
  };
}

function handleFilePickerSelect(options) {
  return async function(evt) {
    initHandleStatus();
    try {
      let handles = await window.chooseFileSystemEntries(options);
      for (const handle of handles) {
        let entry = await createFileTableEntry(handle);
      }
    } catch(e) {
      addLogEvent(`chooseFileSystemEntries failed: ${e}`);
    }
  };
}

function addResult(payload) {
  addToListElem(payload, resultsListElem);
}

function addLogEvent(payload) {
  addToListElem(payload, eventListElem);
}

function addToListElem(payload, targetElem) {
  if (targetElem) {
    let item = document.createElement("li");
    if (payload instanceof HTMLElement) {
      item.append(payload);
    } else {
      // Most likely a string.
      item.innerHTML = payload;
    }
    targetElem.prepend(item);
  } else {
    console.log(`Could not find ${targetElem}`);
  }
}

function promiseGetIDBConn(dbName, version) {
  return new Promise((resolve, reject) => {
    let request = window.indexedDB.open(dbName, version);
    request.onerror = (evt) => {
      addLogEvent(`ERROR opening db: ${dbName}:${version}`);
      reject({request, event: evt});
    };

    request.onsuccess = (evt) => {
      addLogEvent(`successfully opened db: ${dbName}:${version}`);
      resolve(request.result);
    };

    request.onupgradeneeded = (evt) => {
      let db = request.result;
      let objStore = db.createObjectStore(entriesTableName, {keyPath: "name"});
      objStore.transaction.oncomplete = (evt) => {
        let store = db.transaction(entriesTableName, "readwrite").objectStore(entriesTableName);
      };
    };
  });
}

function emojiReaderForFile(file) {
  let reader = new FileReader();

  reader.onload = (function(f) {
    return function(e) {
      addLogEvent(`Success Reading ${f.name}, of type: ${f.type}`);
      let inStr = e.target.result;
      let matches = inStr.matchAll(emojiRegex);
      let emojiCounts = new Map();
      for (let m of matches) {
        emojiCounts[m[0]] = (emojiCounts[m[0]] || 0) + 1;
      }
      if (emojiCounts.size) {
        addResult(`For ${f.name}, Emoji detector found: ${JSON.stringify(emojiCounts)}`);
      } else {
        addResult(`No Emoji found for ${f.name} :-(`);
      }
    };
  })(file);

  reader.onabort = (function(f) {
    return function(e) {
      addLogEvent(`Read aborted ${f.name}`);
    };
  })(file);

  reader.onerror = (function(f) {
    return function(e) {
      addLogEvent(`Error reading ${f.name}`);
    };
  })(file);

  return reader;
}

window.addEventListener('load', async function() {
  setAPIStatus();
  fileHandleCountElem = document.querySelector("#file-handle-count");
  dirHandleCountElem = document.querySelector("#directory-handle-count");
  eventListElem = document.querySelector("#event-list");
  filesListElem = document.querySelector("#files-list");
  resultsListElem = document.querySelector("#results-list");
  dirInputElem = document.querySelector("#directory-selector");
  fileInputElem = document.querySelector("#file-selector");

  dirInputElem.addEventListener('click', handleFilePickerSelect({
    type: "openDirectory",
    multiple: true,
  }), false);
  fileInputElem.addEventListener('click', handleFilePickerSelect({
    type: "openFile",
    multiple: true,
  }), false);

  document.querySelector("#files-list-clear").addEventListener('click', clearFilesList(filesListElem), false);
  document.querySelector("#results-list-clear").addEventListener('click', clearFilesList(resultsListElem), false);
  document.querySelector("#event-list-clear").addEventListener('click', clearChildren(eventListElem), false);

  db = await promiseGetIDBConn("nativefs", 1);
});
