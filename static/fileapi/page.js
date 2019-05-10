"use strict";

const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
let eventListElem;
let fileInputElem;
let dirInputElem;
let progressSinkElem;
let progress = {};

function createProgressEntry(file) {
  let progressElem = document.createElement("tr");
  let label = document.createElement("td");
  label.innerText = file.name;
  let type = document.createElement("td");
  type.innerText = file.type;
  let progressAmount = document.createElement("td");
  progressAmount.innerText = "N/A";
  progressAmount.classList.add("amount");
  progressElem.appendChild(label);
  progressElem.appendChild(type);
  progressElem.appendChild(progressAmount);

  progress[file.name] = progressElem;
  progressSinkElem.appendChild(progressElem);
}

function emojiReaderForFile(file) {
  let reader = new FileReader();

  reader.onload = (function(f) {
    return function(e) {
      addLogEvent(`Success Reading ${f.name}, of type: ${f.type}`);
      let inStr = e.target.result;
      let matches = inStr.matchAll(emojiRegex);
      let emojiCounts = {};
      for (let m of matches) {
        emojiCounts[m[0]] = (emojiCounts[m[0]] || 0) + 1;
      }
      addLogEvent(`Text file ${f.name} loaded. Emoji detector found: ${JSON.stringify(emojiCounts)}`);
    };
  })(file);

  reader.onloadstart = (function(f) {
    return function(e) {
      createProgressEntry(f);
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
      if (evt.total > 0) {
        amountElem.innerText = `${evt.loaded/evt.total * 100}%`;
      } else {
        amountElem.innerText = `nothing to do. size is: ${evt.total}`;
      }
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

  return reader;
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

async function handleFileSelect(evt) {
  let files = evt.target.files;

  for (let file of files) {
    addLogEvent(`ADDED file: "${file.name}" type: "${file.type}" size: ${file.size} bytes webkitRelativePath: ${file.webkitRelativePath}`);

    if (file.type == "application/json" || file.type == "text/plain") {
      let reader = emojiReaderForFile(file);
      reader.readAsText(file);
    } else if (file.type.startsWith("image/")) {
      createProgressEntry(file);
      let dataURL = URL.createObjectURL(file);
      let imgElem;

      if (file.type == "image/svg+xml") {
        try {
          let bitmap = await createImageBitmap(file);
        } catch(e) {
          addLogEvent(`ERROR: Cannot load ${file.name}: ${e}`);
          continue;
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
      divElem.appendChild(imgElem);

      addLogEvent(divElem);
    } else {
      addLogEvent(`No handler for ${file.name} of type ${file.type}`);
    }
  }
}

function addLogEvent(payload) {
  if (eventListElem) {
    let item = document.createElement("li");
    if (payload instanceof HTMLElement) {
      item.appendChild(payload);
    } else {
      // Most likely a string.
      item.innerHTML = payload;
    }
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
  fileInputElem.addEventListener('change', handleFileSelect);
  dirInputElem = document.querySelector("#directory-selector");
  dirInputElem.addEventListener('change', handleFileSelect);
  document.querySelector("#progress-sink-clear").addEventListener('click', clearChildren(progressSinkElem), false);
  document.querySelector("#event-list-clear").addEventListener('click', clearChildren(eventListElem), false);
});
