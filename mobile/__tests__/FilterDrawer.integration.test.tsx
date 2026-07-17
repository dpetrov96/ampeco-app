import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { act, render, screen, userEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { FilterDrawerContent } from '@/components/FilterDrawerContent';
import {
  commitApplyFilters,
  finishApplyFilters,
} from '@/store/slices/filtersSlice';
import { createTestStore } from '@/test/createTestStore';
import { ConnectorStatus, ConnectorType } from '@/types/pin';

function drawerProps(
  overrides: Partial<DrawerContentComponentProps> = {},
): DrawerContentComponentProps {
  return {
    state: {
      stale: false,
      type: 'drawer',
      key: 'drawer',
      index: 0,
      routeNames: ['MapMain'],
      routes: [{ key: 'map', name: 'MapMain' }],
      history: [{ type: 'route', key: 'map' }],
      default: 'closed',
    },
    navigation: {
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      isFocused: () => true,
      canGoBack: () => false,
      getId: () => undefined,
      getParent: () => undefined,
      getState: () => undefined as never,
      setParams: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      removeListener: jest.fn(),
      preload: jest.fn(),
      jumpTo: jest.fn(),
      openDrawer: jest.fn(),
      closeDrawer: jest.fn(),
      toggleDrawer: jest.fn(),
    } as DrawerContentComponentProps['navigation'],
    descriptors: {},
    ...overrides,
  } as DrawerContentComponentProps;
}

describe('FilterDrawerContent (integration)', () => {
  it('Apply commits connector filters into the store (MapScreen settle path)', async () => {
    const user = userEvent.setup();
    const { store } = createTestStore();

    await render(
      <Provider store={store}>
        <FilterDrawerContent {...drawerProps()} />
      </Provider>,
    );

    expect(screen.getByText('Filters')).toBeTruthy();

    await user.press(screen.getByLabelText(ConnectorType.J1772));
    await user.press(screen.getByLabelText(ConnectorType.Ccs2));
    await user.press(screen.getByLabelText(ConnectorType.Type3));
    await user.press(screen.getByText('Unavailable'));
    await user.press(screen.getByText('Apply'));

    expect(store.getState().filters.isApplying).toBe(true);
    expect(store.getState().filters.pending).toEqual({
      types: [ConnectorType.Type2],
      statuses: [ConnectorStatus.Available],
    });

    // Same sequence MapScreen runs after closing the drawer.
    await act(async () => {
      store.dispatch(commitApplyFilters());
      store.dispatch(finishApplyFilters());
    });

    expect(store.getState().filters.isApplying).toBe(false);
    expect(store.getState().filters.applied).toEqual({
      types: [ConnectorType.Type2],
      statuses: [ConnectorStatus.Available],
    });
  });
});
