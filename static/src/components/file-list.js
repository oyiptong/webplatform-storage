import {LitElement, html, css} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store} from '../store.js';
import {openViewer, openEditor} from '../actions/files.js';
import {openHandles, persistEntry, unpersistEntry, refreshPermissionStatus} from '../actions/filesystem.js';

class FileList extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
      table {
        width: 100%;
        font-size: 1em;
      }
      td[directory] {
        font-weight: bold;
        color: #729FCF;
      }
      `
    ];
  }

  static get properties() {
    return {
      entries: Array,
      lastChange: Number,
      debug: Boolean,
    };
  }

  constructor() {
    super();
    this.debug = false;
    this.entries = [];
    this.lastChange = null;
    this.editables = new Set([
      'application/json',
      'application/x-sh',
    ]);
  }

  isPreviewable(type) {
    if (type === 'directory') {
      return false;
    }

    if (this.debug) {
      return true;
    }
    return type.startsWith('image/') && type != 'image/svg+xml';
  }

  isEditable(type) {
    if (type === 'directory') {
      return false;
    }

    if (this.debug) {
      return true;
    }

    if (type.startsWith('text/')) {
      return true;
    }
    return this.editables.has(type);
  }

  triggerView(entry) {
    return (e) => {
      store.dispatch(openViewer(entry));
    };
  }

  triggerEdit(entry) {
    return (e) => {
      store.dispatch(openEditor(entry));
    };
  }

  triggerPersist(entry) {
    return (e) => {
      store.dispatch(persistEntry(entry));
    };
  }

  triggerUnpersist(entry) {
    return (e) => {
      store.dispatch(unpersistEntry(entry));
    };
  }

  triggerReadPermission(entry) {
    return async (e) => {
      await entry.handle.requestPermission();
      store.dispatch(refreshPermissionStatus);
    };
  }

  triggerWritePermission(entry) {
    return async (e) => {
      await entry.handle.requestPermission({writable: true, mode: 'readwrite'});
      store.dispatch(refreshPermissionStatus);
    };
  }

  stateChanged(state) {
    this.entries = state.filesystem.entries;
    this.lastChange = state.filesystem.lastChange;
    this.debug = state.app.debug;
  }

  render() {
    if (!this.entries.length) {
      return html`
        No files open yet. Please open some using the buttons above.
      `;
    }
    return html`
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.entries.map((entry) => {
    const actions = [];
    if (this.isPreviewable(entry.type)) {
      actions.push(html`<button @click="${this.triggerView(entry)}">
                          View</button>`);
    }
    if (this.isEditable(entry.type)) {
      actions.push(html`<button @click="${this.triggerEdit(entry)}">
                          Edit</button>`);
    }
    if (!('id' in entry)) {
      actions.push(html`<button @click="${this.triggerPersist(entry)}">
                           Persist</button>`);
    } else {
      actions.push(html`<button @click="${this.triggerUnpersist(entry)}">
                           Unpersist</button>`);
    }
    if (!entry.isReadable) {
      actions.push(html`<button @click="${this.triggerReadPermission(entry)}">
                           Request read access</button>`);
    }
    if (!entry.isWritable) {
      actions.push(html`<button @click="${this.triggerWritePermission(entry)}">
                           Request write access</button>`);
    }

    return html`
            <tr>
              <td ?directory="${entry.type == 'directory'}">${entry.name}</td>
              <td>${entry.size}</td>
              <td>${entry.type}</td>
              <td>${actions}</td>
            </tr>
            `;
  })}
        </tbody>
      </table>
    `;
  }
}

window.customElements.define('file-list', FileList);
window.addEventListener('load', async () => {
  if ('launchQueue' in window) {
    launchQueue.setConsumer((launchParams) => {
      if (!launchParams.files.length) {
        return;
      }

      store.dispatch(openHandles(launchParams.files));
    });
  }
});
