import { render, screen, userEvent } from '@testing-library/react-native';
import { DrawerActions } from '@react-navigation/native';

import { MapHeaderButtons } from '@/components/MapHeaderButtons';

describe('MapHeaderButtons (integration)', () => {
  it('opens left and right drawers from the map header', async () => {
    const user = userEvent.setup();
    const parentDispatch = jest.fn();
    const dispatch = jest.fn();

    await render(
      <MapHeaderButtons
        navigation={
          {
            dispatch,
            getParent: () => ({ dispatch: parentDispatch }),
          } as never
        }
      />,
    );

    await user.press(screen.getByLabelText('Open settings menu'));
    expect(parentDispatch).toHaveBeenCalledWith(DrawerActions.openDrawer());

    await user.press(screen.getByLabelText('Open filters menu'));
    expect(dispatch).toHaveBeenCalledWith(DrawerActions.openDrawer());
  });
});
