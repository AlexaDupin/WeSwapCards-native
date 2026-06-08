import type { CardItemData } from '@/src/features/cards/types/CardItemType';
import { render, screen } from '@testing-library/react-native';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { State } from 'react-native-gesture-handler';
import type { TapGesture } from 'react-native-gesture-handler';
import React from 'react';
import CardItem from '../components/CardItem';

const mockCard: CardItemData = {
  id: 1,
  name: 'Card A',
  number: 5,
  place_id: 1,
};

describe('CardItem', () => {
  it('renders the card number', () => {
    render(<CardItem item={mockCard} status="default" onSelect={() => {}} />);

    expect(screen.getByText('5')).toBeTruthy();
  });

  it('calls onSelect with the card id when tapped', () => {
    const onSelectMock = jest.fn();

    render(
      <CardItem item={mockCard} status="default" onSelect={onSelectMock} />,
    );

    fireGestureHandler<TapGesture>(getByGestureTestId('tap-1'), [
      { state: State.BEGAN },
      { state: State.ACTIVE },
      { state: State.END },
    ]);

    expect(onSelectMock).toHaveBeenCalledWith(1);
  });
});
