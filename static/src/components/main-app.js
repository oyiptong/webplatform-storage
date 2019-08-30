import {LitElement, html, css} from 'lit-element';
import {installRouter} from 'pwa-helpers/router.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store} from '../store.js';
import {navigate} from '../actions/app.js';
import {checkCapabilities} from '../actions/features.js';
import '../components/app-404.js';
import '../components/feature-status.js';
import '../components/file-explorer.js';
import '../components/file-viewer.js';
import '../components/file-editor.js';
import '../components/error-prompt.js';

class MainApp extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
      ._page {
        display: none;
      }
      ._page[active] {
        display: block;
      }
      error-prompt {
        position: absolute;
        z-index: 900;
      }
     `
    ];
  }

  static get properties() {
    return {
      _page: {type: String},
      message: {type: String},
      featureWantList: {type: Array},
      errorToPrompt: {type: Object},
    };
  }

  firstUpdated() {
    installRouter((location) => {
      store.dispatch(navigate(location));
    });
    store.dispatch(checkCapabilities(this.featureWantList));
  }

  constructor() {
    super();
    this.featureWantList = ['nativefs', 'indexeddb'];
  }

  stateChanged(state) {
    this._page = state.app.page;
    this.errorToPrompt = state.app.errorToPrompt;
  }

  render() {
    const hasError = !!this.errorToPrompt;
    return html`
      <h1>Native File System Demo</h1>
      <feature-status></feature-status>
      <main role="main" class="main-content">
        <error-prompt class="_page" ?active="${hasError}"></error-prompt>
        <file-viewer class="_page" ?active="${this._page === 'home'}">
        </file-viewer>
        <file-editor class="_page" ?active="${this._page === 'home'}">
        </file-editor>
        <file-explorer class="_page" ?active="${this._page === 'home'}">
        </file-explorer>
        <app-404 class="_page"></app-404>
      </main>
    `;
  }
}

window.customElements.define('main-app', MainApp);
