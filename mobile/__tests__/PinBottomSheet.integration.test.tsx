import { fireEvent, render, screen } from '@testing-library/react-native';

import { PinBottomSheet } from '@/components/PinBottomSheet';
import {
  ConnectorStatus,
  ConnectorType,
  type Pin,
} from '@/types/pin';

const pin: Pin = {
  _id: 'pin-1',
  title: 'Dorothea French',
  latitude: 42.6977,
  longitude: 23.3219,
  connectors: [
    { type: ConnectorType.Type2, status: ConnectorStatus.Available },
    { type: ConnectorType.Ccs2, status: ConnectorStatus.Unavailable },
  ],
};

describe('PinBottomSheet (integration)', () => {
  it('shows pin details and connector status colors', async () => {
    const onClose = jest.fn();

    await render(<PinBottomSheet pin={pin} onClose={onClose} />);

    expect(screen.getByText('Dorothea French')).toBeTruthy();
    expect(screen.getByText('42.697700')).toBeTruthy();
    expect(screen.getByText('23.321900')).toBeTruthy();
    expect(screen.getByText(ConnectorType.Type2)).toBeTruthy();
    expect(screen.getByText(ConnectorType.Ccs2)).toBeTruthy();
    expect(screen.getByText('Available')).toBeTruthy();
    expect(screen.getByText('Unavailable')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing when no pin is selected', async () => {
    const view = await render(
      <PinBottomSheet pin={null} onClose={jest.fn()} />,
    );
    expect(view.toJSON()).toBeNull();
  });
});
