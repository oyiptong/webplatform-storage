import {FEATURE_CHECK} from '../actions/features.js';

const defaultState = {};

const features = (state = defaultState, action) => {
  switch (action.type) {
    case FEATURE_CHECK:
      return {
        ...state,
        capabilities: action.capabilities,
      };
    default:
      return state;
  }
};

export default features;
