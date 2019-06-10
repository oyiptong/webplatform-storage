export const FEATURE_CHECK = 'FEATURE_CHECK';

export const checkCapabilities = (featureList) => (dispatch) => {
  dispatch({
    type: FEATURE_CHECK,
    capabilities: featureList,
  });
};
