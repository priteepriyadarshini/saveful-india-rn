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
  [api.reducerPath]: api.reducer,
});

const rootReducer = (state: RootState | undefined, action: Action, ) => {
  if (clearSessionData.fulfilled.match(action)) {
    console.debug('Resetting the redux store because the user is logging out');
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      const middleware = getDefaultMiddleware({
        serializableCheck: {
          warnAfter: 128, 
        },
        immutableCheck: {
          warnAfter: 128, 
        },
      }).concat(api.middleware);

      if (__DEV__) {
        middleware.concat(logger);
      }

      return middleware;
    },
  });
};

export const store = makeStore();

let initialized = false;
setupListeners(
  store.dispatch,
  (dispatch, { onFocus, onFocusLost, onOnline, onOffline }) => {
    
    let appStateListener: NativeEventSubscription | undefined;
    let netInfoListener: (() => void) | undefined;

    if (!initialized) {
      
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

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
