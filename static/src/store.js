import { createStore, compose as origCompose, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';
import app from './reducers/app.js';
import features from './reducers/features.js';
import filesystem from './reducers/filesystem.js';
import files from './reducers/files.js';
const compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || origCompose;

export const store = createStore(
  (state, action) => state,
  compose(lazyReducerEnhancer(combineReducers), applyMiddleware(thunk)),
);

store.addReducers({
  app,
  features,
  filesystem,
  files,
});
