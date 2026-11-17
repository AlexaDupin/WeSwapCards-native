import { Alert, type AlertButton } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useMarkAllCardsOwned } from '@/src/features/cards/hooks/useMarkAllCardsOwned';

jest.mock('@clerk/clerk-expo', () => {
  const getToken = jest.fn().mockResolvedValue('tkn');
  return { useAuth: () => ({ getToken }) };
});

jest.mock('@/src/features/cards/api/cardsApi', () => ({
  markAllCardsOwned: jest.fn(),
}));

const cardsApi = jest.requireMock('@/src/features/cards/api/cardsApi') as {
  markAllCardsOwned: jest.Mock;
};

// Created in beforeEach: the jest config sets restoreMocks, which detaches a
// spy made once at module level.
let alertSpy: jest.SpyInstance;

// Presses the named button of the most recent Alert.alert call.
function pressAlertButton(text: string) {
  const buttons = alertSpy.mock.calls.at(-1)?.[2] as AlertButton[] | undefined;
  const button = buttons?.find((b) => b.text === text);
  if (!button) throw new Error(`No "${text}" button in the last alert`);
  button.onPress?.();
}

function setup() {
  const onMarked = jest.fn();
  const view = renderHook(() =>
    useMarkAllCardsOwned({ explorerId: 7, totalCards: 412, onMarked }),
  );
  return { ...view, onMarked };
}

beforeEach(() => {
  jest.clearAllMocks();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  cardsApi.markAllCardsOwned.mockResolvedValue({
    data: { ok: true, added: 412 },
  });
});

describe('useMarkAllCardsOwned', () => {
  it('asks for confirmation, mentioning the count and duplicates', () => {
    const { result } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, message] = alertSpy.mock.calls[0]!;
    expect(title).toBe('Mark all cards as owned?');
    expect(message).toContain('All 412 cards');
    expect(message).toContain('including your duplicates, stay as they are');
    expect(message).toContain('tap your duplicates again');
    expect(cardsApi.markAllCardsOwned).not.toHaveBeenCalled();
  });

  it('does nothing when the user cancels', () => {
    const { result, onMarked } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });
    pressAlertButton('Cancel');

    expect(cardsApi.markAllCardsOwned).not.toHaveBeenCalled();
    expect(onMarked).not.toHaveBeenCalled();
  });

  it('saves on confirm, then applies the result locally', async () => {
    const { result, onMarked } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });
    await act(async () => {
      pressAlertButton('Mark all as owned');
    });

    await waitFor(() => expect(onMarked).toHaveBeenCalledTimes(1));
    expect(cardsApi.markAllCardsOwned).toHaveBeenCalledWith({
      explorerId: 7,
      headers: { Authorization: 'Bearer tkn' },
    });
    expect(result.current.isMarkingAllOwned).toBe(false);
  });

  it('shows an error and changes nothing locally when the request fails', async () => {
    cardsApi.markAllCardsOwned.mockRejectedValue(new Error('network'));
    const { result, onMarked } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });
    await act(async () => {
      pressAlertButton('Mark all as owned');
    });

    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(2));
    expect(alertSpy.mock.calls[1]![0]).toBe('Something went wrong');
    expect(onMarked).not.toHaveBeenCalled();
    expect(result.current.isMarkingAllOwned).toBe(false);
  });
});
