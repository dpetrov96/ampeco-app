import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupListeners } from '@reduxjs/toolkit/query';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Provider } from 'react-redux';

import { api, useGetPinsQuery } from '@/api';
import { OfflineBanner } from '@/components/OfflineBanner';
import { setIsConnected } from '@/store/slices/networkSlice';
import {
  createPersistedTestStore,
  createTestStore,
  flushPersistWrites,
  waitForRehydrate,
} from '@/test/createTestStore';
import {
  ConnectorStatus,
  ConnectorType,
  type Pin,
} from '@/types/pin';

const cachedPins: Pin[] = [
  {
    _id: 'offline-pin-1',
    title: 'Cached Station',
    latitude: 42.7,
    longitude: 23.3,
    connectors: [
      { type: ConnectorType.Type2, status: ConnectorStatus.Available },
    ],
  },
];

function PinsProbe() {
  const { data = [], isFetching } = useGetPinsQuery();
  return (
    <>
      <Text testID="pin-count">{String(data.length)}</Text>
      <Text testID="pin-title">{data[0]?.title ?? ''}</Text>
      <Text testID="is-fetching">{isFetching ? 'yes' : 'no'}</Text>
    </>
  );
}

function mockPinsResponse(pins: Pin[]) {
  return {
    ok: true,
    status: 200,
    json: async () => pins,
    text: async () => JSON.stringify(pins),
    clone() {
      return this;
    },
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
  };
}

describe('offline mode (integration)', () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('shows a top alert when the connection is lost and hides it when restored', async () => {
    const { store } = createTestStore();

    await render(
      <Provider store={store}>
        <OfflineBanner />
      </Provider>,
    );

    expect(screen.queryByText(/Connection lost/i)).toBeNull();

    await act(async () => {
      store.dispatch(setIsConnected(false));
    });

    expect(
      screen.getByText('Connection lost. Information may be outdated.'),
    ).toBeTruthy();

    await act(async () => {
      store.dispatch(setIsConnected(true));
    });

    expect(screen.queryByText(/Connection lost/i)).toBeNull();
  });

  it('keeps the last fetched pins after a restart (cached while offline)', async () => {
    const first = createPersistedTestStore();
    await waitForRehydrate(first.persistor);

    first.store.dispatch(
      api.util.upsertQueryData('getPins', undefined, cachedPins),
    );
    await flushPersistWrites();
    first.persistor.pause();

    const second = createPersistedTestStore();
    await waitForRehydrate(second.persistor);

    const cached = api.endpoints.getPins.select()(second.store.getState());
    expect(cached.data).toEqual(cachedPins);
  });

  it('refetches pins when the connection is restored', async () => {
    const fetchMock = jest
      .fn()
      // initial load
      .mockResolvedValueOnce(mockPinsResponse(cachedPins))
      // reconnect refetch
      .mockResolvedValueOnce(
        mockPinsResponse([
          {
            ...cachedPins[0],
            title: 'Refetched Station',
          },
        ]),
      );

    global.fetch = fetchMock as unknown as typeof fetch;

    const { store } = createTestStore();

    let goOnline: (() => void) | undefined;
    let goOffline: (() => void) | undefined;

    const unsubscribe = setupListeners(store.dispatch, (dispatch, actions) => {
      goOnline = () => {
        dispatch(setIsConnected(true));
        dispatch(actions.onOnline());
      };
      goOffline = () => {
        dispatch(setIsConnected(false));
        dispatch(actions.onOffline());
      };
      return () => {};
    });

    await render(
      <Provider store={store}>
        <OfflineBanner />
        <PinsProbe />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('pin-title').props.children).toBe(
        'Cached Station',
      );
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      goOffline?.();
    });
    expect(
      screen.getByText('Connection lost. Information may be outdated.'),
    ).toBeTruthy();
    // Stale cache remains visible while offline
    expect(screen.getByTestId('pin-title').props.children).toBe(
      'Cached Station',
    );

    await act(async () => {
      goOnline?.();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('pin-title').props.children).toBe(
        'Refetched Station',
      );
    });
    expect(screen.queryByText(/Connection lost/i)).toBeNull();

    unsubscribe();
  });
});
