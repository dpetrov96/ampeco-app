import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import {
  persistReducer,
  persistStore,
} from 'redux-persist';

import { api } from '@/api';
import filtersReducer from '@/store/slices/filtersSlice';
import networkReducer, { setIsConnected } from '@/store/slices/networkSlice';
import settingsReducer from '@/store/slices/settingsSlice';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  filters: filtersReducer,
  settings: settingsReducer,
  network: networkReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', api.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Large RTK Query cache (~20k pins) makes these deep walks too slow in dev.
      immutableCheck: false,
      serializableCheck: false,
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch, (dispatch, actions) => {
  const appStateSub = AppState.addEventListener('change', (status) => {
    if (status === 'active') {
      dispatch(actions.onFocus());
    } else {
      dispatch(actions.onFocusLost());
    }
  });

  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    const online = Boolean(
      state.isConnected && state.isInternetReachable !== false,
    );
    dispatch(setIsConnected(online));
    if (online) {
      dispatch(actions.onOnline());
    } else {
      dispatch(actions.onOffline());
    }
  });

  return () => {
    appStateSub.remove();
    unsubscribeNetInfo();
  };
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
