"use strict";

const entriesTableName = "entries";
let eventListElem;
let dirInputElem;
let fileInputElem;
let filesListElem;
let entries = [];
let db;

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

function setStatus() {
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
  clearChildren(elem);
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
    entry.size = file.size;
    entry.type = `${entry.type}: ${file.type}`;
  } else {
    let subEntries = await handle.getEntries();
    for await (const subHandle of subEntries) {
      await createFileTableEntry(subHandle);
    }
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

  let readButton = document.createElement("button");
  let deleteButton = document.createElement("button");

  readButton.innerText = "Read";
  readButton.classList.add("btn", "btn-info");

  deleteButton.innerText = "Remove";
  deleteButton.classList.add("btn", "btn-danger");


  buttonGroup.appendChild(readButton);
  buttonGroup.appendChild(deleteButton);
  actionsElem.appendChild(buttonGroup);

  rowElem.appendChild(labelElem);
  rowElem.appendChild(typeElem);
  rowElem.appendChild(sizeElem);
  rowElem.appendChild(actionsElem);
  filesListElem.appendChild(rowElem);
}

function handleFilePickerSelect(options) {
  return async function(evt) {
    try {
      let handles = await window.chooseFileSystemEntries(options);
      for (const handle of handles) {
        await createFileTableEntry(handle);
      }
    } catch(e) {
      addLogEvent(`chooseFileSystemEntries failed: ${e}`);
    }
  };
}

function addLogEvent(message) {
  if (eventListElem) {
    let item = document.createElement("li");
    item.innerHTML = message;
    eventListElem.appendChild(item);
  } else {
    console.log("Could not find #event-list");
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

window.addEventListener('load', async function() {
  setStatus();
  eventListElem = document.querySelector("#event-list");
  filesListElem = document.querySelector("#files-list");
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
  document.querySelector("#event-list-clear").addEventListener('click', clearChildren(eventListElem), false);

  db = await promiseGetIDBConn("nativefs", 1);
});
