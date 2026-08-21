import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DeleteAccountDialog from '@/src/features/auth/components/DeleteAccountDialog';

// The tick box is the whole point of this dialog: it is what stops a mis-tap in
// the account menu from destroying an account. Worth a test on that gate alone.

const ACK = 'I understand that this cannot be undone';

function setup(
  overrides: Partial<React.ComponentProps<typeof DeleteAccountDialog>> = {},
) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  render(
    <DeleteAccountDialog
      visible
      deleting={false}
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...overrides}
    />,
  );

  return { onConfirm, onCancel };
}

describe('DeleteAccountDialog', () => {
  it('keeps the delete button disabled until the box is ticked', () => {
    setup();

    expect(screen.getByText('Delete my account')).toBeDisabled();
  });

  it('enables and fires the delete once the box is ticked', () => {
    const { onConfirm } = setup();

    fireEvent.press(screen.getByLabelText(ACK));
    fireEvent.press(screen.getByText('Delete my account'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancels without deleting', () => {
    const { onCancel, onConfirm } = setup();

    fireEvent.press(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
