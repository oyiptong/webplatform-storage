"use strict";

let eventListElem;
let fileInputElem;
let dirInputElem;
let progressSinkElem;
let progress = {};

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

function handleFileSelect(evt) {
  let files = evt.target.files;

  for (let file of files) {
    addLogEvent(`ADDED file: "${file.name}" type: "${file.type}" size: ${file.size} bytes`);
    let reader = new FileReader();
    reader.onload = (function(f) {
      return function(e) {
        addLogEvent(`Success Loading ${f.name}`);
        let buf = e.target.result;
        let numExclamations = 0;
        for (let i = 0; i < buf.length; i++) {
          if (buf[i] == 0x21) {
            numExclamations++;
          }
        }
        addLogEvent(`number of ! for ${f.name}: ${numExclamations}`);
      };
    })(file);

    reader.onloadstart = (function(f) {
      return function(e) {
        let progressElem = document.createElement("tr");
        let label = document.createElement("td");
        label.innerText = f.name;
        let progressAmount = document.createElement("td");
        progressAmount.innerText = "0%";
        progressAmount.classList.add("amount");
        progressElem.appendChild(label);
        progressElem.appendChild(progressAmount);

        progress[f.name] = progressElem;
        progressSinkElem.appendChild(progressElem);
      };
    })(file);


    let updateProgress = (function(f) {
      return function(evt) {

        if (evt.type == 'loadend') {
          fileInputElem.value = '';
          dirInputElem.value = '';
        }

        let progressElem = progress[f.name];
        if (!progressElem) {
          addLogEvent(`ERROR: Cannot update progress for ${f.name}: element not found.`);
          return;
        }

        if (!evt.lengthComputable) {
          addLogEvent(`Not updating progress for ${f.name}. Length is not computable.`);
          return;
        }

        let amountElem = progressElem.querySelector('.amount');
        amountElem.innerText = `${evt.loaded/evt.total * 100}%`;
      };
    })(file);

    reader.onloadend = updateProgress;
    reader.onprogress = updateProgress;

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

    reader.readAsArrayBuffer(file);
  }
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

function setStatus() {
  let statusFElem = document.querySelector("#status-fileapi");
  if (FileReader) {
    statusFElem.innerText = "OK";
    statusFElem.className = "text-success";
  } else {
    statusFElem.innerText = "API not available";
    statusFElem.className = "text-danger";
  }
}

window.addEventListener('load', async function() {
  setStatus();
  eventListElem = document.querySelector("#event-list");
  progressSinkElem = document.querySelector("#progress-sink");
  fileInputElem = document.querySelector("#file-selector");
  fileInputElem.addEventListener('change', handleFileSelect, false);
  dirInputElem = document.querySelector("#file-selector");
  dirInputElem.addEventListener('change', handleFileSelect);
  document.querySelector("#progress-sink-clear").addEventListener('click', clearChildren(progressSinkElem), false);
  document.querySelector("#event-list-clear").addEventListener('click', clearChildren(eventListElem), false);
});
