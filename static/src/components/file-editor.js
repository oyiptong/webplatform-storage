import {LitElement, html, css} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store} from '../store.js';
import {closeEditor, editorClosePermissionError} from '../actions/files.js';
import {writeFile, saveAs} from '../actions/filesystem.js';

class FileEditor extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
      section {
        display: none;
        position: fixed;
        display: none;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 2;
        overflow: auto;
      }

      section[active] {
        display: block;
      }

      .contents {
        background-color: #FEFEFE;
        margin: 0 auto;
        top: 0;
        bottom: 0;
        padding: 0 20px;
        border: 0;
        position: relative;
        width: 80%;
        z-index: 4;
      }

      button[hidden] {
        display: none;
      }

      textarea {
        width: 100%;
        padding: 0;
        margin: 15px auto;
        border: 1px solid #333;
        font-family: Courier, Monaco, monospace;
        whitespace: pre;
        overflow-wrap: break-word;
        overflow: scroll-y;
        resize: none;
        min-height: calc(100vh - 10em);
      }

      h2 {
        margin: 0;
      }

      #modal {
        position: fixed;
        background-color: rgba(0.7, 0, 0, 0.5);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }

      #permission-error-prompt {
        position: absolute;
        top: 5%;
        min-height: 100px;
        width: 80%;
        border: 5px solid red;
        left: 50%;
        transform: translateX(-50%);
        padding: 1em;
        background-color: #FFF;
      }

      #error-message {
        font-family: monospace;
        border: 1px solid #EEE;
      }

      #permission-error button {
        float: right;
      }
      `
    ];
  }

  static get properties() {
    return {
      entry: {type: Object},
      permissionError: {type: Object},
      fileData: {type: String},
    };
  }

  closeEditor() {
    store.dispatch(closeEditor);
  }

  closePermissionError() {
    store.dispatch(editorClosePermissionError);
  }

  captureChange(e) {
    this.changeBuffer = e.target.value;
  }

  saveFile() {
    store.dispatch(writeFile(this.entry, this.changeBuffer));
  }

  saveAs() {
    store.dispatch(saveAs(this.changeBuffer));
  }

  stateChanged(state) {
    this.entry = state.files.editorEntry;
    if (this.entry) {
      this.permissionError = state.files.permissionError;
      if (this.entry.isEmpty) {
        this.isEmpty = true;
        this.fileData = '';
        return;
      }

      this.isEmpty = false;
      this.fileName = this.entry.handle.name;
      this.fileData = state.files.editorFileData;
      this.changeBuffer = this.fileData;
    } else {
      // Clear out stale data if any, or initialize.
      this.entry = null;
      this.fileName = null;
      this.fileData = null;
      this.changeBuffer = null;
      this.isEmpty = false;
      this.permissionError = null;
    }
  }

  render() {
    const fileName = this.fileName ? this.fileName : 'Untitled';
    const hasPermissionError = this.permissionError != null;
    const permissionErrorMessage = hasPermissionError ?
          this.permissionError.errorMessage : 'no content';

    return html`
      <section ?active="${!!this.entry}">
        <div class="contents">
          <h2>${fileName}</h2>
          <nav>
            <button ?hidden="${this.isEmpty}" @click="${this.saveFile}">
              Save
            </button>
            <button @click="${this.saveAs}">Save As</button>
            <button @click="${this.closeEditor}">Close Editor</button>
          </nav>
          <textarea wrap="off"
                    rows="1"
                    @input="${this.captureChange}"
                    .value="${this.fileData}"></textarea>
          <div id="modal" ?hidden="${!hasPermissionError}">
            <div id="permission-error-prompt">
              <h2>Permission Denied Error</h2>
              <p>There was an error saving the file. Error message:</p>
              <p id="error-message">${permissionErrorMessage}</p>
              <p>Change your permission settings and try again.</p>
              <button @click="${this.closePermissionError}">Close</button>
            </div>
          </> <!-- modal -->
        </div>
      </section>
    `;
  };
}

window.customElements.define('file-editor', FileEditor);
