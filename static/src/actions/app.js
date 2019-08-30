import {html} from 'lit-element';

export const UPDATE_PAGE = 'UPDATE_PAGE';
export const TOGGLE_DEBUG_MODE = 'TOGGLE_DEBUG_MODE';
export const SHOW_ERROR_PROMPT = 'SHOW_ERROR_PROMPT';
export const CLOSE_ERROR_PROMPT = 'CLOSE_ERROR_PROMPT';

export const WRITE_PERMISSION_ERROR = 'WRITE_PERMISSION_ERROR';
export const FEATURE_NOT_ENABLED_ERROR = 'FEATURE_NOT_ENABLED_ERROR';

export const toggleDebug = (dispatch, getState) => {
  const debug = !getState().app.debug;
  if (debug) {
    window.localStorage.setItem('debug', 1);
  } else {
    window.localStorage.removeItem('debug');
  }
  dispatch({type: TOGGLE_DEBUG_MODE, debug});
};

export const navigate = (location) => (dispatch) => {
  // Extract the page name from path.
  // Any other info you might want to extract from the path (like page type),
  // you can do here.

  // Used only for routing:
  // const pathname = location.pathname;
  // const parts = pathname.slice(1).split('/');

  // query is extracted from the search string: /explore?q={query}
  const match = RegExp('[?&]q=([^&]*)').exec(location.search);
  const query = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  const hash = window.location.hash;
  const page = hash.replace(/^\#\//, '') || 'home';

  dispatch(loadPage(page, query));
};

const loadPage = (page, query) => async (dispatch, getState) => {
  switch (page) {
    case 'home':
      break;
    case 'editor':
      break;
    default:
      page = '404';
  }

  dispatch(updatePage(page));
};

const updatePage = (page) => {
  return {
    type: UPDATE_PAGE,
    page
  };
};

export const showErrorPrompt = (errorType,
    errorMessage,
    dispatch) => {
  let title = 'Unknown Error';
  let explanation = 'An error happened.';
  let nextSteps = 'Please retry.';
  const message = errorMessage;

  switch (errorType) {
    case WRITE_PERMISSION_ERROR:
      title = 'Permission Error';
      explanation = 'An error ocurred while writing the file:';
      nextSteps = 'Please check your permissions and try again.';
      break;
    case FEATURE_NOT_ENABLED_ERROR:
      title = 'Feature Not Enabled';
      explanation = 'The Native File System API is not enabled.';
      nextSteps = html`
       <span>
       Please go to <a href="chrome://flags">chrome://flags</a> and enable the flags:
       <ul>
         <li>Experimental Web Platform Features</li>
         <li>Native File System API</li>
       </ul>
       </span>`;
      break;
    default:
      console.log('Unknown error being prompted.');
  }
  dispatch({
    type: SHOW_ERROR_PROMPT,
    errorToPrompt: {title, explanation, message, nextSteps},
  });
};

export const closeErrorPrompt = (dispatch) => {
  dispatch({
    type: CLOSE_ERROR_PROMPT,
  });
};
