import { LitElement, html, css } from 'lit-element';
import { installRouter } from 'pwa-helpers/router.js';
import { updateMetadata } from 'pwa-helpers/metadata.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';
import { navigate } from '../actions/app.js';
import { checkCapabilities } from '../actions/features.js';
import './app-home.js';
import('../components/editor.js');
import('../components/app-404.js');
import('../components/feature-status.js');
import('../components/file-explorer.js');

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
     `
    ];
  }

  static get properties() {
    return {
      _page: String,
      message: String,
      featureWantList: Array,
    };
  }

  firstUpdated() {
    installRouter((location) => {
      store.dispatch(navigate(location));
    });
    console.log("check capabilities");
    store.dispatch(checkCapabilities(this.featureWantList));
  }

  constructor() {
    super();
    this.featureWantList = ['nativefs', 'indexeddb'];
  }

  stateChanged(state) {
    this._page = state.app.page;
  }

  render() {
    updateMetadata({
      title: `Home`,
      description: 'Suite of stuff'
    });

    return html`
      <h1>Native File System Demo</h1>
      <nav>
        <a ?selected="${this._page === 'home'}" href="/">Home</a>
        <a ?selected="${this._page === 'editor'}" href="#/editor">Editor</a>
        <a ?selected="${this._page === 'explore'}" href="#/explore">Explore</a>
      </nav>
      <feature-status></feature-status>
      <main role="main" class="main-content">
        <editor-app class="_page" ?active="${this._page === 'editor'}"></editor-app>
        <file-explorer class="_page" ?active="${this._page === 'home'}"></file-explorer>
        <app-404 class="_page" ?active="${this._page === '404'}"></app-404>
      </main>
    `;
  }
}

window.customElements.define('main-app', MainApp);
