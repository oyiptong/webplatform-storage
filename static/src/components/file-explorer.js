import {LitElement, html, css} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store} from '../store.js';
import {openEditor} from '../actions/files.js';
import {openHandles, closeAllHandles} from '../actions/filesystem.js';
import '../components/file-list.js';

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
        font-family: "Roboto", Arial, Helvetica, sans-serif;
        font-weight: bold;
        text-transform: uppercase;
        margin-left: 15px;
        box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
                    0px 2px 2px 0px rgba(0, 0, 0, 0.14),
                    0px 1px 5px 0px rgba(0,0,0,.12);
        border: none;
        border-radius: 4px;
      }
      button:hover {
        opacity: 0.8;
      }
      button.directory {
        background-color: #6200EE;
        color: white;
      }
      button.new-file {
        background-color: #03DAC5;
        color: white;
      }
      button.files {
        background-color: #3700B3;
        color: white;
      }
      button.close-all {
        background-color: pink;
      }
      button[hidden] {
        display: none;
      }
      `
    ];
  }

  openFilepicker(options) {
    return async function(e) {
      try {
        const handles = await window.chooseFileSystemEntries(options);
        store.dispatch(openHandles(handles));
      } catch (e) {
        console.log(e);
      }
    };
  }

  newFile() {
    store.dispatch(openEditor({isEmpty: true}));
  }

  closeAllHandles(e) {
    store.dispatch(closeAllHandles);
  }

  static get properties() {
    return {
      showCloseButton: {type: Boolean},
    };
  }

  stateChanged(state) {
    if (state.filesystem.entries) {
      this.showCloseButton = state.filesystem.entries.length > 0;
    }
  }

  constructor() {
    super();
    this.showCloseButton = false;
  }

  render() {
    return html`
      <div class="row">
          <button @click="${this.newFile}" class="new-file">New File</button>
          <button @click="${this.openFilepicker(
      {type: 'open-directory', multiple: true})}"
                  class="directory">Open Directory</button>
          <button @click="${this.openFilepicker(
      {type: 'open-file', multiple: true})}"
                  class="files">Open Files</button>
          <button @click="${this.closeAllHandles}"
                  ?hidden="${!this.showCloseButton}"
                  class="close-all">Close All Files</button>
      </div>
      <hr>
      <file-list class="row"></file-list>
    `;
  }
}

window.customElements.define('file-explorer', FileExplorer);
