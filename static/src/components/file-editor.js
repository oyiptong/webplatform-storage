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
      `
    ];
  }

  static get properties() {
    return {
      entry: { type: Object },
      fileData: { type: String },
      editAreaHeight: { type: String },
    };
  }

  closeEditor() {
    store.dispatch(closeEditor);
  }

  captureChange(e) {
    this.changeBuffer = e.target.value;
    this.editAreaHeight = e.target.scrollHeight + 'px';
  }

  saveFile() {
    store.dispatch(writeFile(this.entry, this.changeBuffer));
  }

  stateChanged(state) {
    this.entry = state.files.editorEntry;
    this.fileData = state.files.editorFileData;
  }

  constructor() {
    super();
    this.entry = null;
    this.fileData = null;
    this.changeBuffer = null;
    this.editAreaHeight = "auto";
  }

  updated() {
    // Auto-resizing for textarea.
    let textarea = this.shadowRoot.querySelector('textarea');
    let expectedHeight = textarea.scrollHeight + "px";
    textarea.style.height = expectedHeight;
  }

  render() {
    return html`
      <style>
        textarea {
          width: 100%;
          padding: 0;
          margin: 15px auto;
          border: 1px solid #333;
          font-family: Courier, Monaco, monospace;
          whitespace: pre;
          overflow-wrap: break-word;
          overflow: hidden;
          resize: none;
          height: auto;
          height: ${this.editAreaHeight};
        }
      </style>
      <section ?active="${!!this.entry}">
        <div class="contents">
          <nav>
            <button @click="${this.saveFile}">Save</button>
            <button @click="${this.closeEditor}">Close Editor</button>
          </nav>
          <textarea wrap="off" rows="1" @input="${this.captureChange}" .value="${this.fileData}"></textarea>
        </div>
      </section>
    `;
  };
}

window.customElements.define('file-editor', FileEditor);
