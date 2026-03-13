import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDashboard } from '@/src/features/dashboard/hooks/useDashboard';
import type {
  DashboardConversation,
  PastCursor,
} from '@/src/features/dashboard/types/DashboardTypes';

// ---- Stable mock refs ----

const isUnreadMock = jest.fn();
const setUiUnreadBaseMock = jest.fn();

// ---- Module mocks ----

jest.mock('@/src/features/dashboard/api/dashboardApi', () => ({
  fetchInProgressConversations: jest.fn(),
  fetchPastFirstPage: jest.fn(),
  fetchPastNextPage: jest.fn(),
  updateConversationStatus: jest.fn(),
  getUnreadCounts: jest.fn(),
  markConversationUnread: jest.fn(),
}));

jest.mock('@/src/features/dashboard/hooks/useUiUnreadOverrides', () => ({
  useUiUnreadOverrides: jest.fn(() => ({
    isUnread: isUnreadMock,
    setUiUnread: setUiUnreadBaseMock,
  })),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(() => {}),
}));

// ---- Typed mocked module access ----

const dashboardApi = jest.requireMock(
  '@/src/features/dashboard/api/dashboardApi',
) as jest.Mocked<typeof import('@/src/features/dashboard/api/dashboardApi')>;

// ---- Factories ----

function createDashboardConversation(
  overrides: Partial<DashboardConversation> = {},
): DashboardConversation {
  return {
    db_id: 1,
    card_name: 'Mock Card',
    swap_explorer: 'Mock Explorer',
    swap_explorer_id: 42,
    status: 'In progress',
    creator_id: 10,
    recipient_id: 20,
    unread: 0,
    last_message_at: '2026-03-12T12:00:00.000Z',
    ...overrides,
  };
}

function createInProgressConversation(
  overrides: Partial<DashboardConversation> = {},
): DashboardConversation {
  return createDashboardConversation({
    status: 'In progress',
    ...overrides,
  });
}

function createPastConversation(
  overrides: Partial<DashboardConversation> = {},
): DashboardConversation {
  return createDashboardConversation({
    status: 'Completed',
    ...overrides,
  });
}

function createPastCursor(overrides: Partial<PastCursor> = {}): PastCursor {
  return {
    cursor_last_message_at: '2026-03-12T12:00:00.000Z',
    cursor_id: 1,
    ...overrides,
  };
}

// ---- Helpers ----

function createAuthHeadersMock() {
  return jest.fn().mockResolvedValue({
    Authorization: 'Bearer test-token',
  });
}

function renderUseDashboard(options?: {
  explorerId?: number | null;
  authHeaders?: () => Promise<Record<string, string>>;
}) {
  const { explorerId = 123, authHeaders = createAuthHeadersMock() } =
    options ?? {};

  const hook = renderHook(() =>
    useDashboard({
      explorerId,
      authHeaders,
    }),
  );

  return {
    ...hook,
    authHeaders,
  };
}

async function waitForInitialLoadToFinish(
  result: ReturnType<typeof renderUseDashboard>['result'],
) {
  await waitFor(() => {
    expect(result.current.loadingInitial).toBe(false);
  });
}

beforeEach(() => {
  jest.clearAllMocks();

  isUnreadMock.mockReturnValue(false);
  setUiUnreadBaseMock.mockReset();
});

describe('useDashboard', () => {
  it('loads in-progress conversations on initial render', async () => {
    const conversations = [
      createInProgressConversation({ db_id: 1 }),
      createInProgressConversation({ db_id: 2 }),
    ];

    dashboardApi.getUnreadCounts.mockResolvedValue({
      inProgress: 3,
      past: 1,
    });
    dashboardApi.fetchInProgressConversations.mockResolvedValue(conversations);

    const { result } = renderUseDashboard();

    await waitForInitialLoadToFinish(result);

    expect(result.current.unreadCounts).toEqual({
      inProgress: 3,
      past: 1,
    });
    expect(result.current.listData).toEqual(conversations);
    expect(result.current.loadingInitial).toBe(false);
  });
});
