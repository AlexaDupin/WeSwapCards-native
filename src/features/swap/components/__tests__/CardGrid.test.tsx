import { fireEvent, render, screen } from '@testing-library/react-native';

import CardGrid from '@/src/features/swap/components/CardGrid';
import { createCard } from '@/src/features/swap/testFixtures';

const cards = [
  createCard({ id: 1, number: 1 }),
  createCard({ id: 2, number: 2 }),
];

describe('CardGrid', () => {
  it('renders no locks when missing cards are not provided', () => {
    render(
      <CardGrid cards={cards} selectedCardId={null} onSelectCard={jest.fn()} />,
    );

    expect(screen.getByLabelText('Select card 1')).toBeTruthy();
    expect(screen.getByLabelText('Select card 2')).toBeTruthy();
    expect(screen.queryByTestId('card-lock-1')).toBeNull();
    expect(screen.queryByTestId('card-lock-2')).toBeNull();
  });

  it('marks missing cards with a grey lock and a missing label', () => {
    render(
      <CardGrid
        cards={cards}
        selectedCardId={null}
        missingCardIds={new Set([2])}
        onSelectCard={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Select card 2, missing')).toBeTruthy();
    expect(screen.getByTestId('card-lock-2').props.color).toBe(
      'rgba(0,0,0,0.35)',
    );
    expect(screen.queryByTestId('card-lock-1')).toBeNull();
  });

  it('turns the lock white on a selected missing card and still selects it', () => {
    const onSelectCard = jest.fn();
    render(
      <CardGrid
        cards={cards}
        selectedCardId={2}
        missingCardIds={new Set([2])}
        onSelectCard={onSelectCard}
      />,
    );

    expect(screen.getByTestId('card-lock-2').props.color).toBe('#fff');

    fireEvent.press(screen.getByLabelText('Select card 2, missing'));
    expect(onSelectCard).toHaveBeenCalledWith(2);
  });
});
