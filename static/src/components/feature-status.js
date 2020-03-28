import {LitElement, html, css} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {store} from '../store.js';
import {toggleDebug} from '../actions/app.js';

class FeatureStatus extends connect(store)(LitElement) {
  static get styles() {
    return [
      css`
      .feature-status-table {
        position: absolute;
        font-size: 0.5em;
        font-family: "Courier New", Courier, monospace;
        top: 0;
        right: 0;
        border-collapse: collapse;
      }
      td {
        border: 1px solid #DDD;
        padding: 2px 5px;
      }
      .label {
        font-weight: bold;
      }
      .status-text {
        text-align: right;
      }
      .text-success {
        color: green;
      }
      .text-danger {
        color: red;
      }
      button.debug-btn {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
      }
      button.debug-btn:hover {
        text-decoration: underline;
      }
     `
    ];
  }

  static get properties() {
    return {
      capabilities: Object,
      wantList: Array,
      debug: Boolean,
    };
  }

  constructor() {
    super();
    this.capabilities = {
      indexeddb: {
        label: 'IndexedDB',
        status: 'Loading...',
        available: null,
        enabled: true,
      },
      nativefs: {
        label: 'Native File System',
        status: 'Loading...',
        available: null,
        enabled: true,
      },
      filehandling: {
        label: 'File Type Handling',
        status: 'Loading...',
        available: null,
        enabled: true,
      }
    };
    this.wantList = ['nativefs', 'indexeddb', 'filehandling'];
    this.debug = false;
  }

  triggerDebug() {
    store.dispatch(toggleDebug);
  }

  stateChanged(state) {
    if (!state.features || !state.features.capabilities) {
      return;
    }
    this.debug = state.app.debug;
    const enabled = state.app.featuresEnabled;
    for (const want of this.wantList) {
      const available = !!state.features.capabilities[want];
      this.capabilities[want].available = available;
      this.capabilities[want].enabled = enabled.has(want);
    }
  }

  render() {
    let debugStatus = '';
    let debugText = 'OFF';
    if (this.debug) {
      debugStatus = 'text-danger';
      debugText = 'ON';
    }
    return html`
    <table class="feature-status-table">
      <tr>
        <td class="label">
          <button class="debug-btn" @click="${this.triggerDebug}">
            Debug Mode
          </button>
        </td>
        <td class="status-text ${debugStatus}">${debugText}</td>
      </tr>
    ${this.wantList.map((want) => {
    const feature = this.capabilities[want];
    let statusClass = 'text-danger';
    let statusText = 'OK';

    if (feature.enabled && feature.available) {
      statusClass = 'text-success';
    }

    if (!feature.available) {
      statusText = 'Not Available';
    } else if (!feature.enabled) {
      statusText = 'Disabled';
    }

    return html`
        <tr>
        <td class="label">${feature.label}</td>
        <td class="status-text ${statusClass}">${statusText}</td>
        </tr>
      `;
  })}
    </table>
    `;
  }
}

window.customElements.define('feature-status', FeatureStatus);
