import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import TipBubble from '../components/TipBubble';
import { tips } from '../data/tips';
import { useTip } from '../hooks/useTip';

jest.mock('@/src/features/tips/hooks/useTip', () => ({
  useTip: jest.fn(),
}));

const mockUseTip = useTip as jest.Mock;
const dismiss = jest.fn();

beforeEach(() => {
  dismiss.mockClear();
  mockUseTip.mockReturnValue({ status: 'unseen', dismiss });
});

describe('TipBubble', () => {
  it('renders the tip for the tab it is given', () => {
    render(<TipBubble tipKey="cards" />);

    expect(screen.getByText(tips.cards.title)).toBeTruthy();
    expect(screen.getByText(tips.cards.body)).toBeTruthy();
  });

  it.each(['loading', 'seen'] as const)('renders nothing when %s', (status) => {
    mockUseTip.mockReturnValue({ status, dismiss });

    render(<TipBubble tipKey="cards" />);

    expect(screen.queryByText(tips.cards.title)).toBeNull();
  });

  it('dismisses when the close button is pressed', () => {
    render(<TipBubble tipKey="dashboard" />);

    fireEvent.press(screen.getByLabelText('Dismiss tip'));

    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
