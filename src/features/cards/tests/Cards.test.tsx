import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';
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
  markAllCardsOwned: jest
    .fn()
    .mockResolvedValue({ status: 200, data: { ok: true, added: 1 } }),
}));

const cardsApi = jest.requireMock('@/src/features/cards/api/cardsApi') as {
  fetchCardStatuses: jest.Mock;
  markAllCardsOwned: jest.Mock;
};

// The card shows its state via the background of the `card-<id>` view:
// default (missing) is a recessed grey, owned/duplicated are a raised white.
const DEFAULT_BG = Colors.tileMissingBg;
const OWNED_BG = '#fff';

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
    expect(card).toHaveStyle({ backgroundColor: DEFAULT_BG });
  });

  it('changes from default to owned after a tap', async () => {
    render(<Cards />);
    await screen.findByTestId('card-5');

    tapCard5();

    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        backgroundColor: OWNED_BG,
      }),
    );
  });

  it('changes from owned to duplicated after a second tap', async () => {
    render(<Cards />);
    await screen.findByTestId('card-5');

    tapCard5();
    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        backgroundColor: OWNED_BG,
      }),
    );

    tapCard5();
    await waitFor(() => expect(screen.getByTestId('badge-5')).toBeTruthy());
    expect(screen.getByTestId('card-5')).toHaveStyle({
      backgroundColor: OWNED_BG,
    });
  });

  it('resets to default after a long press', async () => {
    render(<Cards />);
    await screen.findByTestId('card-5');

    tapCard5();
    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        backgroundColor: OWNED_BG,
      }),
    );

    longPressCard5();

    await waitFor(() =>
      expect(screen.getByTestId('card-5')).toHaveStyle({
        backgroundColor: DEFAULT_BG,
      }),
    );
  });

  describe('mark all cards as owned', () => {
    // Presses the named button of the most recent confirmation alert.
    const confirmAlert = (alertSpy: jest.SpyInstance, text: string) => {
      const buttons = alertSpy.mock.calls.at(-1)?.[2] as
        | AlertButton[]
        | undefined;
      buttons?.find((b) => b.text === text)?.onPress?.();
    };

    it('offers new explorers the banner and marks their cards owned', async () => {
      cardsApi.fetchCardStatuses.mockResolvedValueOnce({ '5': 'default' });
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

      render(<Cards />);
      await screen.findByTestId('new-collector-banner');

      fireEvent.press(screen.getByLabelText('Mark all as owned'));
      expect(alertSpy).toHaveBeenCalledTimes(1);

      await act(async () => {
        confirmAlert(alertSpy, 'Mark all as owned');
      });

      await waitFor(() =>
        expect(screen.getByTestId('card-5')).toHaveStyle({
          backgroundColor: OWNED_BG,
        }),
      );
      expect(cardsApi.markAllCardsOwned).toHaveBeenCalledWith({
        explorerId: 1,
        headers: { Authorization: 'Bearer test-token' },
      });
      expect(screen.queryByTestId('new-collector-banner')).toBeNull();

      alertSpy.mockRestore();
    });

    it('hides the banner once a card is logged but keeps the menu', async () => {
      cardsApi.fetchCardStatuses.mockResolvedValueOnce({ '5': 'owned' });

      render(<Cards />);
      await screen.findByTestId('card-5');

      expect(screen.queryByTestId('new-collector-banner')).toBeNull();

      fireEvent.press(screen.getByLabelText('Collection actions'));
      expect(await screen.findByText('Mark all cards as owned')).toBeTruthy();
    });
  });
});
