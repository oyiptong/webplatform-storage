import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';
import { openViewer, openEditor } from '../actions/files.js';

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
      "application/json",
      "application/x-sh",
    ]);
  }

  isPreviewable(type) {
    if (type === "directory") {
      return false;
    }

    if (this.debug) {
      return true;
    }
    return type.startsWith("image/") && type != "image/svg+xml";
  }

  isEditable(type) {
    if (type === "directory") {
      return false;
    }

    if (this.debug) {
      return true;
    }

    if (type.startsWith("text/")) {
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
          ${this.entries.map(entry => {
            let actions = [];
            if (this.isPreviewable(entry.type)) {
              actions.push(html`<button @click="${this.triggerView(entry)}">View</button>`);
            }
            if (this.isEditable(entry.type)) {
              actions.push(html`<button @click="${this.triggerEdit(entry)}">Edit</button>`);
            }
            return html`
            <tr>
              <td ?directory="${!entry.file}">${entry.name}</td>
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
