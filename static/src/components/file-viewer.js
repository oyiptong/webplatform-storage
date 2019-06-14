import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';
import { closeViewer } from '../actions/files.js';

class FileViewer extends connect(store)(LitElement) {
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
      img {
        width: 100%;
      }
      `
    ];
  }

  static get properties() {
    return {
      entry: { type: Object },
    };
  }

  closeViewer() {
    store.dispatch(closeViewer);
  }

  stateChanged(state) {
    this.entry = state.files.viewerEntry;

    if (this.entry) {
      if (this.entry.type.startsWith("image/")) {
        this.imageDataURL = state.files.viewerObjectURL;
      }
    } else {
      this.imageDataURL = null;
    }
  }

  constructor() {
    super();
    this.entry = null;
    this.imageDataURL = null;
  }

  render() {
    return html`
      <section ?active="${this.entry}" @click="${this.closeViewer}">
        <div class="contents">
          <image src="${this.imageDataURL ? this.imageDataURL : ""}"></image>
        </div>
      </section>
    `;
  };
}

window.customElements.define('file-viewer', FileViewer);
