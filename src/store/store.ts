import NetInfo from '@react-native-community/netinfo';
import { combineReducers, configureStore, Action } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import api from '../modules/api';
import sessionReducer, { clearSessionData } from '../modules/auth/sessionSlice';
import featureFlagsSlice from '../modules/developer/featureFlags/slice';
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
} from 'react-native';
import logger from 'redux-logger';

const appReducer = combineReducers({
  session: sessionReducer,
  featureFlags: featureFlagsSlice.reducer,
  // RTK Query
  [api.reducerPath]: api.reducer,
});

// Root reducer to listen to all actions
const rootReducer = (state: RootState | undefined, action: Action, ) => {
  // If the action is a log out action, reset the store
  // if (action.type === 'session/clearSessionData/fulfilled') {
  if (clearSessionData.fulfilled.match(action)) {
    console.debug('Resetting the redux store because the user is logging out');
    // Reset the store
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      const middleware = getDefaultMiddleware().concat(api.middleware);

      if (__DEV__) {
        middleware.concat(logger);
      }

      return middleware;
    },
  });
};

export const store = makeStore();

// Setup listeners for RTK Query
let initialized = false;
setupListeners(
  store.dispatch,
  (dispatch, { onFocus, onFocusLost, onOnline, onOffline }) => {
    // Future person:
    let appStateListener: NativeEventSubscription | undefined;
    let netInfoListener: (() => void) | undefined;

    if (!initialized) {
      // Listen for app state changes
      appStateListener = AppState.addEventListener(
        'change',
        (state: AppStateStatus) => {
          if (state === 'active') {
            dispatch(onFocus());
          } else if (state === 'inactive') {
            dispatch(onFocusLost());
          }
        },
      );

      // Listen for network changes
      netInfoListener = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          dispatch(onOnline());
        } else {
          dispatch(onOffline());
        }
      });

      initialized = true;
    }
    const unsubscribe = () => {
      appStateListener?.remove();
      appStateListener = undefined;
      initialized = false;

      netInfoListener?.();
      netInfoListener = undefined;
    };
    return unsubscribe;
  },
);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
