import {
  showErrorPrompt,
  FEATURE_NOT_ENABLED_ERROR,
} from '../actions/app.js';

export const FEATURE_CHECK = 'FEATURE_CHECK';

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
      case 'filehandling':
        capabilities['filehandling'] = detectFileHandling();
        break;
    }
  }
  return capabilities;
}

function detectIndexedDB() {
  return 'indexedDB' in window;
}

function detectNativeFS() {
  return 'chooseFileSystemEntries' in window;
}

function detectFileHandling() {
  return 'launchQueue' in window;
}

export const checkCapabilities = (featureList) => (dispatch) => {
  const capabilities = verifyPlatformCapabilities(featureList);
  if (!capabilities['nativefs']) {
    showErrorPrompt(
        FEATURE_NOT_ENABLED_ERROR,
        'window.chooseFileSystemEntries is undefined.',
        dispatch);
  }
  dispatch({
    type: FEATURE_CHECK,
    capabilities,
  });
};
