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

export const checkCapabilities = (featureList) => (dispatch) => {
  const capabilities = verifyPlatformCapabilities(featureList);
  dispatch({
    type: FEATURE_CHECK,
    capabilities,
  });
};
