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
    };
  }

  constructor() {
    super();
    this.entries = [];
    this.editables = new Set(["application/json", "text/plain"]);
  }

  isPreviewable(type) {
    return type.startsWith("image/") && type != "image/svg+xml";
  }

  isEditable(type) {
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
    if (!state.filesystem.entries) {
      return;
    }
    this.entries = state.filesystem.entries;
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
