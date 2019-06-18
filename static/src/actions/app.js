export const UPDATE_PAGE = 'UPDATE_PAGE';
export const TOGGLE_DEBUG_MODE = 'TOGGLE_DEBUG_MODE';

export const toggleDebug = (dispatch) => {
  dispatch({type: TOGGLE_DEBUG_MODE});
};

export const navigate = (location) => (dispatch) => {
  // Extract the page name from path.
  // Any other info you might want to extract from the path (like page type),
  // you can do here.
  const pathname = location.pathname;
  const parts = pathname.slice(1).split('/');
  // query is extracted from the search string: /explore?q={query}
  const match = RegExp('[?&]q=([^&]*)').exec(location.search);
  const query = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  const hash = window.location.hash;
  const page = hash.replace(/^\#\//,'') || 'home';

  dispatch(loadPage(page, query));
};

const loadPage = (page, query) => async (dispatch, getState) => {
  switch(page) {
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
}
