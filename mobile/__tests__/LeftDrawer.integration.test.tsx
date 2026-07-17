import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { render, screen, userEvent } from '@testing-library/react-native';

import { LeftDrawerContent } from '@/components/LeftDrawerContent';

describe('LeftDrawerContent (integration)', () => {
  it('navigates to Settings when the menu item is pressed', async () => {
    const user = userEvent.setup();
    const navigate = jest.fn();

    await render(
      <LeftDrawerContent
        {...({
          state: {
            stale: false,
            type: 'drawer',
            key: 'drawer',
            index: 0,
            routeNames: ['Map', 'Settings'],
            routes: [
              { key: 'map', name: 'Map' },
              { key: 'settings', name: 'Settings' },
            ],
            history: [{ type: 'route', key: 'map' }],
            default: 'closed',
          },
          navigation: {
            navigate,
            closeDrawer: jest.fn(),
            openDrawer: jest.fn(),
            toggleDrawer: jest.fn(),
            dispatch: jest.fn(),
            goBack: jest.fn(),
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
          },
          descriptors: {},
        } as unknown as DrawerContentComponentProps)}
      />,
    );

    expect(screen.getByText('Settings')).toBeTruthy();
    await user.press(screen.getByLabelText('Open settings'));
    expect(navigate).toHaveBeenCalledWith('Settings');
  });
});
