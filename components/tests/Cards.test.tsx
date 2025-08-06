import React from 'react';
import { render, screen, userEvent } from '@testing-library/react-native';
import Cards from '../../app/(tabs)/cards';

test('card status changes from default to owned after press', async () => {
  render(<Cards />);

  const cardStyleView = screen.getByTestId('card-5');
  expect(cardStyleView).toHaveStyle({ backgroundColor: '#dedcd7' });

  await userEvent.press(screen.getByTestId('card-touch-5'));
  expect(cardStyleView).toHaveStyle({ backgroundColor: '#b5e8da' });
});
