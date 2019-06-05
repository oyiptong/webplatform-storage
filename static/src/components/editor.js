import { LitElement, html } from 'lit-element';
import { updateMetadata } from 'pwa-helpers/metadata.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';

class EditorApp extends connect(store)(LitElement) {
  render() {
    updateMetadata({
      title: `Editor`,
      description: 'A text editor',
    });

    return html`
      <section>
        <h2>Editor</h2>
        <p>foo</p>
        <button>Open file</button>
      </section>
    `;
  }
}

window.customElements.define('editor-app', EditorApp);
