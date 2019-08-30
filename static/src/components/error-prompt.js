import {LitElement, html, css} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store} from '../store.js';
import {closeErrorPrompt} from '../actions/app.js';

class ErrorPrompt extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
      main {
        position: fixed;
        background-color: rgba(0.7, 0, 0, 0.5);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }

      #error-prompt {
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

      #error-prompt button {
        float: right;
      }

      h2 {
        margin: 0;
      }
      `
    ];
  }
  static get properties() {
    return {
      errorToPrompt: {type: Object},
    };
  }

  closeErrorPrompt() {
    store.dispatch(closeErrorPrompt);
  }

  constructor() {
    super();
    this.errorToPrompt = null;
  }

  stateChanged(state) {
    this.errorToPrompt = state.app.errorToPrompt;
  }

  render() {
    const hasError = this.errorToPrompt != null;
    const error = hasError ? this.errorToPrompt : {};
    return html`
          <main>
            <div id="error-prompt">
              <h2>${error.title}</h2>
              <p>${error.explanation}</p>
              <p id="error-message">${error.message}</p>
              <p>${error.nextSteps}</p>
              <button @click="${this.closeErrorPrompt}">Close</button>
            </div>
          </main>
    `;
  }
}

window.customElements.define('error-prompt', ErrorPrompt);
