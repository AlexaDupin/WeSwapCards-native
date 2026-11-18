import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

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

function setup() {
  const onMarked = jest.fn();
  const view = renderHook(() =>
    useMarkAllCardsOwned({ explorerId: 7, onMarked }),
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
  it('opens the confirmation without saving anything', () => {
    const { result } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });

    expect(result.current.confirmVisible).toBe(true);
    expect(cardsApi.markAllCardsOwned).not.toHaveBeenCalled();
  });

  it('closes the confirmation on cancel and saves nothing', () => {
    const { result, onMarked } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });
    act(() => {
      result.current.cancelMarkAllCardsOwned();
    });

    expect(result.current.confirmVisible).toBe(false);
    expect(cardsApi.markAllCardsOwned).not.toHaveBeenCalled();
    expect(onMarked).not.toHaveBeenCalled();
  });

  it('saves on confirm, applies the result locally, and closes', async () => {
    const { result, onMarked } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });
    await act(async () => {
      await result.current.confirmMarkAllCardsOwned();
    });

    expect(cardsApi.markAllCardsOwned).toHaveBeenCalledWith({
      explorerId: 7,
      headers: { Authorization: 'Bearer tkn' },
    });
    expect(onMarked).toHaveBeenCalledTimes(1);
    expect(result.current.confirmVisible).toBe(false);
    expect(result.current.isMarkingAllOwned).toBe(false);
  });

  it('shows an error and changes nothing locally when the request fails', async () => {
    cardsApi.markAllCardsOwned.mockRejectedValue(new Error('network'));
    const { result, onMarked } = setup();

    act(() => {
      result.current.requestMarkAllCardsOwned();
    });
    await act(async () => {
      await result.current.confirmMarkAllCardsOwned();
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0]![0]).toBe('Something went wrong');
    expect(onMarked).not.toHaveBeenCalled();
    expect(result.current.confirmVisible).toBe(false);
    expect(result.current.isMarkingAllOwned).toBe(false);
  });
});
