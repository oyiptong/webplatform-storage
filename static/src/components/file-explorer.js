import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';
import { openHandles } from '../actions/filesystem.js';
import('../components/file-list.js');

class FileExplorer extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
      .row {
        display: flex;
        flex-wrap: wrap;
        margin-right: -15px;
        margin-left: -15px;
      }
      hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
        border: 0;
        border-top: 1px solid rgba(0,0,0,.1)
      }
      button {
        padding: 5px 15px;
        font-weight: bold;
        margin-left: 15px;
      }
      button.directory {
        background-color: #714CFE;
        color: white;
        border: 1px solid gray;
      }
      button.files {
        background-color: white;
        border: 1px solid #333;
      }
      `
    ];
  }

  openFilepicker(options) {
    return async function(e) {
      let handles = await window.chooseFileSystemEntries(options);
      store.dispatch(openHandles(handles));
    };

  }

  static get properties() {
    return {
    };
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="row">
          <button @click="${this.openFilepicker({type: "openDirectory", multiple: true})}" class="directory">Open Directory</button>
          <button @click="${this.openFilepicker({type: "openFile", multiple: true})}" class="files">Open Files</button>
      </div>
      <hr>
      <file-list class="row"></file-list>
    `;
  }
}

window.customElements.define('file-explorer', FileExplorer);
