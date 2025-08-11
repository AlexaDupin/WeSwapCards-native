import { render, screen, userEvent } from '@testing-library/react-native';
import React from 'react';
import Cards from '../../app/(tabs)/cards';

describe('Cards', () => {
  let cardStyleView: ReturnType<typeof screen.getByTestId>;
  let touchable: ReturnType<typeof screen.getByTestId>;

  beforeEach(() => {
    render(<Cards />);
    cardStyleView = screen.getByTestId('card-5');
    touchable = screen.getByTestId('card-touch-5');
  });

  test('card status changes from default to owned after press', async () => {
    expect(cardStyleView).toHaveStyle({ backgroundColor: '#dedcd7' });

    await userEvent.press(screen.getByTestId('card-touch-5'));
    expect(cardStyleView).toHaveStyle({ backgroundColor: '#b5e8da' });
  });

  test('card status changes from owned to duplicated after second press', async () => {
    // First press > owned
    await userEvent.press(touchable);

    // Second press > duplicated
    await userEvent.press(touchable);
    expect(cardStyleView).toHaveStyle({ backgroundColor: '#b5e8da' });
    const badge = screen.getByTestId('badge-5');
    expect(badge).toBeTruthy();
  });

  test('card resets to default after long press', async () => {
    // First press > owned
    await userEvent.press(touchable);

    // Long press > reset
    await userEvent.longPress(touchable);

    expect(cardStyleView).toHaveStyle({ backgroundColor: '#dedcd7' });
  });
});