import { LitElement, html, css } from 'lit-element';
import { updateMetadata } from 'pwa-helpers/metadata.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store } from '../store.js';

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
     `
    ];
  }

  static get properties() {
    return {
      capabilities: Object,
      wantList: Array,
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
      }
    };
    this.wantList = ['nativefs', 'indexeddb'];
  }

  stateChanged(state) {
    if (!state.features) {
      return;
    }
    let enabled = state.app.featuresEnabled;
    for (let want of this.wantList) {
      let available = !!state.features[want];
      this.capabilities[want].available = available;
      this.capabilities[want].enabled = enabled.has(want);
    }
  }

  render() {
    return html`
    <table class="feature-status-table">
    ${this.wantList.map(want => {
      let feature = this.capabilities[want];
      let statusClass = "text-danger";
      let statusText = "OK";

      if (feature.enabled && feature.available) {
        statusClass = "text-success";
      }

      if (!feature.available) {
        statusText = "Not Available";
      } else if (!feature.enabled) {
        statusText = "Disabled";
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
