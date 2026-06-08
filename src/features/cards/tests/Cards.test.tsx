import { render, screen, waitFor } from '@testing-library/react-native';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { State } from 'react-native-gesture-handler';
import type {
  LongPressGesture,
  TapGesture,
} from 'react-native-gesture-handler';
import React from 'react';
import { Colors } from '@/src/constants/Colors';
import Cards from '../../../../app/(tabs)/cards';

// jest.mock is hoisted above the imports above, so the screen loads with these
// mocks in place. getToken is created once inside the factory so its identity is
// stable across renders; an unstable getToken would change useCardsScreen's fetch
// effect deps and cause a refetch loop.
jest.mock('@clerk/clerk-expo', () => {
  const getToken = jest.fn().mockResolvedValue('test-token');
  return { useAuth: () => ({ getToken }) };
});

jest.mock('@/src/features/auth/context/ExplorerContext', () => ({
  useExplorer: () => ({ explorerId: 1 }),
}));

jest.mock('@/src/features/cards/api/cardsApi', () => ({
  fetchPlaces: jest.fn().mockResolvedValue([{ id: 1, name: 'Chapter 1' }]),
  fetchCards: jest
    .fn()
    .mockResolvedValue([{ id: 5, name: 'Card 5', number: 5, place_id: 1 }]),
  fetchCardStatuses: jest.fn().mockResolvedValue({}),
  upsertExplorerCard: jest.fn(({ duplicate }: { duplicate: boolean }) =>
    Promise.resolve({ status: 200, data: { duplicate } }),
  ),
  deleteExplorerCard: jest.fn().mockResolvedValue({ status: 200 }),
  setChapterCardsStatus: jest.fn().mockResolvedValue({ status: 200 }),
}));

// The card shows its state via the border color of the `card-<id>` view:
// default is a faint grey, owned/duplicated use the brand secondary color.
const DEFAULT_BORDER = 'rgba(0,0,0,0.12)';
const OWNED_BORDER = Colors.secondary;

const tapCard5 = () =>
  fireGestureHandler<TapGesture>(getByGestureTestId('tap-5'), [
    { state: State.BEGAN },
    { state: State.ACTIVE },
    { state: State.END },
  ]);

const longPressCard5 = () =>
  fireGestureHandler<LongPressGesture>(getByGestureTestId('longpress-5'), [
    { state: State.BEGAN },
    { state: State.ACTIVE },
    { state: State.END },
  ]);

describe('Cards', () => {
  it('renders a fetched card in the default state', async () => {
    render(<Cards />);

    const card = await screen.findByTestId('card-5');
    expect(card).toHaveStyle({ borderColor: DEFAULT_BORDER });
  });

  it('changes from default to owned after a tap', async () => {
    render(<Cards />);
    await screen.findByTestId('card-5');

    tapCard5();

    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        borderColor: OWNED_BORDER,
      }),
    );
  });

  it('changes from owned to duplicated after a second tap', async () => {
    render(<Cards />);
    await screen.findByTestId('card-5');

    tapCard5();
    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        borderColor: OWNED_BORDER,
      }),
    );

    tapCard5();
    await waitFor(() => expect(screen.getByTestId('badge-5')).toBeTruthy());
    expect(screen.getByTestId('card-5')).toHaveStyle({
      borderColor: OWNED_BORDER,
    });
  });

  it('resets to default after a long press', async () => {
    render(<Cards />);
    await screen.findByTestId('card-5');

    tapCard5();
    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        borderColor: OWNED_BORDER,
      }),
    );

    longPressCard5();

    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        borderColor: DEFAULT_BORDER,
      }),
    );
  });
});
