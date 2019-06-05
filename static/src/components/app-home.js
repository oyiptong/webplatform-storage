import { LitElement, html } from 'lit-element';
import { updateMetadata } from 'pwa-helpers/metadata.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';

class AppHome extends connect(store)(LitElement) {
  render() {
    updateMetadata({
      title: `Home`,
      description: 'Home Page',
    });

    return html`
      <section>
        <h2>Welcome home!</h2>
        <p>Yes, welcome <a href="/">Home</a> and try again?
        </p>
      </section>
    `;
  }
}

window.customElements.define('app-home', AppHome);
