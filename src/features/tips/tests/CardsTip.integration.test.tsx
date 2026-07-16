import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';

import Cards from '../../../../app/(tabs)/cards';
import { tips } from '../data/tips';

// Scope: proves the tip is really wired into a live screen — that it mounts,
// reads the store, shows the right tab's copy, and disappears on dismiss.
// TipBubble's own test stubs useTip out and Cards.test.tsx has tips defaulted
// off, so nothing else would catch a missing render or a swapped tipKey.

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
  upsertExplorerCard: jest.fn(),
  deleteExplorerCard: jest.fn(),
  setChapterCardsStatus: jest.fn(),
}));

// Overrides the suite-wide "already dismissed" default from jest.setup.js so
// this file sees the screen as a first-time explorer does.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const store = jest.requireMock('expo-secure-store') as {
  getItemAsync: jest.Mock;
  setItemAsync: jest.Mock;
};

describe('first-run tip on the cards screen', () => {
  it('greets a first-time explorer and stays gone once dismissed', async () => {
    render(<Cards />);

    expect(await screen.findByText(tips.cards.title)).toBeTruthy();
    expect(screen.getByText(tips.cards.body)).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Dismiss tip'));

    expect(screen.queryByText(tips.cards.title)).toBeNull();
    await waitFor(() =>
      expect(store.setItemAsync).toHaveBeenCalledWith('tip.1.cards', 'true'),
    );
  });

  it('leaves the screen alone for an explorer who dismissed it', async () => {
    store.getItemAsync.mockResolvedValue('true');

    render(<Cards />);

    expect(await screen.findByText('Chapter 1')).toBeTruthy();
    expect(screen.queryByText(tips.cards.title)).toBeNull();
  });
});
