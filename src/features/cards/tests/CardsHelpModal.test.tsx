import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import CardsHelpModal from '../components/CardsHelpModal';
import { cardsHelpItems } from '../data/cardsHelpItems';

describe('CardsHelpModal', () => {
  it('renders every gesture explained on the cards screen', () => {
    render(<CardsHelpModal visible onClose={() => {}} />);

    expect(screen.getByText('How to log your cards')).toBeTruthy();

    cardsHelpItems.forEach(({ title, text }) => {
      expect(screen.getByText(title)).toBeTruthy();
      expect(screen.getByText(text)).toBeTruthy();
    });
  });

  it('renders nothing while hidden', () => {
    render(<CardsHelpModal visible={false} onClose={() => {}} />);

    expect(screen.queryByText('How to log your cards')).toBeNull();
  });

  it('closes when Got it is pressed', () => {
    const onClose = jest.fn();
    render(<CardsHelpModal visible onClose={onClose} />);

    fireEvent.press(screen.getByText('Got it'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
