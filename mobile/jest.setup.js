/* Jest setup for unit + integration tests. */

const { NativeModules } = require('react-native');

NativeModules.ClusterBadgeModule = {
  getBadgeUri: (count) => `data:image/png;base64,badge-${count}`,
  getPinUri: (label) => `data:image/png;base64,pin-${label}`,
};

const mockAsyncStorageStore = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn((key, value) => {
      mockAsyncStorageStore.set(key, value);
      return Promise.resolve();
    }),
    getItem: jest.fn((key) =>
      Promise.resolve(mockAsyncStorageStore.get(key) ?? null),
    ),
    removeItem: jest.fn((key) => {
      mockAsyncStorageStore.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      mockAsyncStorageStore.clear();
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() =>
      Promise.resolve([...mockAsyncStorageStore.keys()]),
    ),
    multiGet: jest.fn((keys) =>
      Promise.resolve(
        keys.map((key) => [key, mockAsyncStorageStore.get(key) ?? null]),
      ),
    ),
    multiSet: jest.fn((entries) => {
      for (const [key, value] of entries) {
        mockAsyncStorageStore.set(key, value);
      }
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys) => {
      for (const key of keys) {
        mockAsyncStorageStore.delete(key);
      }
      return Promise.resolve();
    }),
  },
}));


jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
    }),
  ),
}));

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    TouchableOpacity: View,
    Directions: {},
  };
});

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('@react-navigation/drawer', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');

  return {
    createDrawerNavigator: jest.fn(),
    DrawerContentScrollView: ({ children, ...props }) =>
      React.createElement(ScrollView, props, children),
    useDrawerStatus: jest.fn(() => 'open'),
  };
});
