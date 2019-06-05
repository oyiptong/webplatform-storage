export const FEATURE_CHECK = 'FEATURE_CHECK';

export const checkCapabilities = (featureList) => (dispatch) => {
  console.log(`action, checkCapabilities: ${JSON.stringify(featureList)}`);
  dispatch({
    type: FEATURE_CHECK,
    capabilities: featureList,
  });
};
