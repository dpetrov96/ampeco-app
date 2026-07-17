import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { act, render, screen, userEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { FilterDrawerContent } from '@/components/FilterDrawerContent';
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
    } as unknown as DrawerContentComponentProps['navigation'],
    descriptors: {},
    ...overrides,
  } as unknown as DrawerContentComponentProps;
}

describe('FilterDrawerContent (integration)', () => {
  it('Apply closes the drawer and commits filters', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const { store } = createTestStore();
    const props = drawerProps();

    await render(
      <Provider store={store}>
        <FilterDrawerContent {...props} />
      </Provider>,
    );

    expect(screen.getByText('Filters')).toBeTruthy();

    await user.press(screen.getByLabelText(ConnectorType.J1772));
    await user.press(screen.getByLabelText(ConnectorType.Ccs2));
    await user.press(screen.getByLabelText(ConnectorType.Type3));
    await user.press(screen.getByText('Unavailable'));
    await user.press(screen.getByText('Apply'));

    expect(props.navigation.closeDrawer).toHaveBeenCalled();
    expect(store.getState().filters.isApplying).toBe(true);
    expect(store.getState().filters.pending).toEqual({
      types: [ConnectorType.Type2],
      statuses: [ConnectorStatus.Available],
    });

    await act(async () => {
      jest.advanceTimersByTime(250);
    });

    expect(store.getState().filters.isApplying).toBe(false);
    expect(store.getState().filters.applied).toEqual({
      types: [ConnectorType.Type2],
      statuses: [ConnectorStatus.Available],
    });

    jest.useRealTimers();
  });
});
