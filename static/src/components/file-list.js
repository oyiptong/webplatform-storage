import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';

class FileList extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
      table {
        width: 100%;
        font-size: 1em;
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
            <th>Type</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.entries.map(entry => {
            return html`
            <tr>
              <td>${entry.name}</td>
              <td>${entry.mimetype}</td>
              <td>${entry.size}</td>
              <td>ACTIONS</td>
            </tr>
            `;
          })}
        </tbody>
      </table>
    `;
  }
}

window.customElements.define('file-list', FileList);
