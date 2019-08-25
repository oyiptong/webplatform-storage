import {FEATURE_CHECK} from '../actions/features.js';

const defaultState = {};

const features = (state = defaultState, action) => {
  switch (action.type) {
    case FEATURE_CHECK:
      const capabilities = verifyPlatformCapabilities(action.capabilities);
      return {
        ...state,
        ...capabilities,
      };

    default:
      return state;
  }
};

function verifyPlatformCapabilities(featureList) {
  const capabilities = {};
  for (const feature of featureList) {
    switch (feature) {
      case 'indexeddb':
        capabilities['indexeddb'] = detectIndexedDB();
        break;
      case 'nativefs':
        capabilities['nativefs'] = detectNativeFS();
        break;
    }
  }
  return capabilities;
}

function detectIndexedDB() {
  return !!window.indexedDB;
}

function detectNativeFS() {
  return !!window.chooseFileSystemEntries;
}

export default features;
