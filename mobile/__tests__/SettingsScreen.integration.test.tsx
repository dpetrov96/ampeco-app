import { render, screen, userEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import { SettingsScreen } from '@/screens/SettingsScreen';
import { createTestStore } from '@/test/createTestStore';

const mockNavigate = jest.fn();
const mockCloseDrawer = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      closeDrawer: mockCloseDrawer,
    }),
  };
});

describe('SettingsScreen (integration)', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockCloseDrawer.mockClear();
  });

  it('updates pin style in the store and returns to the map', async () => {
    const user = userEvent.setup();
    const { store } = createTestStore();

    await render(
      <Provider store={store}>
        <SettingsScreen />
      </Provider>,
    );

    expect(store.getState().settings.pinStyle).toBe('pin');
    expect(screen.getByText('Pin style')).toBeTruthy();

    await user.press(screen.getByText('Dot'));

    expect(store.getState().settings.pinStyle).toBe('dot');
    expect(mockNavigate).toHaveBeenCalledWith('Map');
    expect(mockCloseDrawer).toHaveBeenCalled();
  });
});
