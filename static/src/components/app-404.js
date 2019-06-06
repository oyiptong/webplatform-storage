import { LitElement, html } from 'lit-element';
import { updateMetadata } from 'pwa-helpers/metadata.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';

class App404 extends connect(store)(LitElement) {
  render() {
    return html`
      <section>
        <h2>Oops! You hit a 404</h2>
        <p>The page you're looking for doesn't seem to exist. Head back
           <a href="/">Home</a> and try again?
        </p>
      </section>
    `;
  }
}

window.customElements.define('app-404', App404);
