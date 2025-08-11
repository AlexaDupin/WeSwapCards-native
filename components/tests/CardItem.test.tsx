import type { CardItemData } from '@/types/cardItemType';
import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import CardItem from '../CardItem';

const mockCard: CardItemData = {
  id: 1,
  name: 'Card A',
  number: 5,
  place_id: 1,
};

describe('CardItem', () => {
  it('renders the card number', () => {
    render(
      <CardItem
        item={mockCard}
        status="default"
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('5')).toBeTruthy();
  });

  it('calls onSelect when pressed', async () => {
    const onSelectMock = jest.fn();

    render(
      <CardItem
        item={mockCard}
        status="default"
        onSelect={onSelectMock}
      />
    );

    await userEvent.press(screen.getByText('5'));
    expect(onSelectMock).toHaveBeenCalled();
  });
});
