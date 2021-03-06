import { createStore, applyMiddleware } from 'redux';
import { createHashHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'react-router-redux';
import { createLogger } from 'redux-logger';
import { stateTransformer } from 'redux-seamless-immutable';

import rootReducer from './rootReducer';
import rootSaga from '../sagas/rootSaga';

export const history = createHashHistory();
const sagaMiddleware = createSagaMiddleware();
const loggerMiddleware = createLogger({
  stateTransformer,
  collapsed: true
});

const configureStoreProduction = (initialState) => {
  const middlewares = [
    sagaMiddleware,
    routerMiddleware(history)
  ];

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );

  sagaMiddleware.run(rootSaga);

  return store;
};

const configureStoreDev = (initialState) => {
  const middlewares = [
    sagaMiddleware,
    routerMiddleware(history),
    loggerMiddleware
  ];

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );

  if (module.hot) {
    module.hot.accept('./rootReducer', () => {
      const nextReducer = require('./rootReducer').default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }

  sagaMiddleware.run(rootSaga);

  return store;
};

const configureStore = process.env.NODE_ENV === 'development'
  ? configureStoreDev
  : configureStoreProduction;

export default configureStore;
