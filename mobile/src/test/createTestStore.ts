import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
  type Persistor,
} from 'redux-persist';

import { api } from '@/api';
import filtersReducer from '@/store/slices/filtersSlice';
import networkReducer from '@/store/slices/networkSlice';
import settingsReducer from '@/store/slices/settingsSlice';

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  filters: filtersReducer,
  settings: settingsReducer,
  network: networkReducer,
});

export type TestRootState = ReturnType<typeof rootReducer>;
export type TestStore = ReturnType<typeof createTestStore>['store'];

export function createTestStore(preloadedState?: Partial<TestRootState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as TestRootState | undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

  return { store };
}

export function createPersistedTestStore() {
  const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['settings', api.reducerPath],
  };

  const store = configureStore({
    reducer: persistReducer(persistConfig, rootReducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(api.middleware),
  });

  const persistor = persistStore(store);
  return { store, persistor };
}

export function waitForRehydrate(persistor: Persistor): Promise<void> {
  return new Promise((resolve) => {
    if (persistor.getState().bootstrapped) {
      resolve();
      return;
    }
    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        unsubscribe();
        resolve();
      }
    });
  });
}

export async function flushPersistWrites(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 50);
  });
}
