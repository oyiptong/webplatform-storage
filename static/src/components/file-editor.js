import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';
import { closeEditor } from '../actions/files.js';
import { writeFile } from '../actions/filesystem.js';

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
        margin: 20px auto;
        top: 5%;
        bottom: 5%;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        z-index: 4;
      }
      pre {
        border: 1px solid #888;
        overflow: auto;
        width: 100%;
        height: 100%;
      }
      `
    ];
  }

  static get properties() {
    return {
      entry: { type: Object },
    };
  }

  closeEditor() {
    store.dispatch(closeEditor);
  }

  captureChange(e) {
    this.changeBuffer = e.target.innerText;
  }

  saveFile() {
    store.dispatch(writeFile(this.entry, this.changeBuffer));
  }

  async performUpdate() {
    if (this.entry) {
      let file = this.entry.file;
      this.fileData = await new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target.result);
        };
        reader.readAsText(file);
      });
    }

    super.performUpdate();
  }

  stateChanged(state) {
    this.entry = state.files.editorEntry;
  }

  constructor() {
    super();
    this.entry = null;
    this.fileData = "";
    this.changeBuffer = null;
  }

  render() {
    return html`
      <section ?active="${!!this.entry}">
        <div class="contents">
          <nav>
            <button @click="${this.saveFile}">Save</button>
            <button @click="${this.closeEditor}">Close Editor</button>
          </nav>
          <pre contenteditable="true" @input="${this.captureChange}">${this.fileData}</pre>
        </div>
      </section>
    `;
  };
}

window.customElements.define('file-editor', FileEditor);
