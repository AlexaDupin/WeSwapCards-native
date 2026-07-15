import {
  blockUser,
  getMyBlocks,
  reportUser,
  unblockUser,
} from '@/src/features/moderation/api/moderationApi';

// Mock only the network boundary. These tests lock down the request contract
// (URL + body + headers) the backend moderation routes expect.
jest.mock('@/src/lib/axiosInstance', () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const { axiosInstance } = jest.requireMock('@/src/lib/axiosInstance') as {
  axiosInstance: { get: jest.Mock; post: jest.Mock; delete: jest.Mock };
};

const headers = { Authorization: 'Bearer t' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('blockUser', () => {
  it('POSTs an empty body to /block/:explorerId/:targetExplorerId', async () => {
    axiosInstance.post.mockResolvedValue({});

    await blockUser({ explorerId: 3, targetExplorerId: 9, headers });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/block/3/9',
      {},
      { headers, timeout: 20000 },
    );
  });
});

describe('unblockUser', () => {
  it('DELETEs /block/:explorerId/:targetExplorerId', async () => {
    axiosInstance.delete.mockResolvedValue({});

    await unblockUser({ explorerId: 3, targetExplorerId: 9, headers });

    expect(axiosInstance.delete).toHaveBeenCalledWith('/block/3/9', {
      headers,
      timeout: 20000,
    });
  });
});

describe('getMyBlocks', () => {
  it('GETs /block/:explorerId and returns the rows', async () => {
    const rows = [
      { blocked_id: 9, blocked_name: 'Sam', created_at: '2026-07-15' },
    ];
    axiosInstance.get.mockResolvedValue({ data: rows });

    await expect(getMyBlocks({ explorerId: 3, headers })).resolves.toEqual(
      rows,
    );
    expect(axiosInstance.get).toHaveBeenCalledWith('/block/3', {
      headers,
      timeout: 20000,
    });
  });

  it('falls back to [] when the response has no data', async () => {
    axiosInstance.get.mockResolvedValue({ data: undefined });

    await expect(getMyBlocks({ explorerId: 3, headers })).resolves.toEqual([]);
  });
});

describe('reportUser', () => {
  it('POSTs the report payload to /report/:explorerId', async () => {
    axiosInstance.post.mockResolvedValue({});

    await reportUser({
      explorerId: 3,
      reportedExplorerId: 9,
      conversationId: 7,
      reason: 'spam',
      comment: 'details',
      headers,
    });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/report/3',
      {
        reported_explorer_id: 9,
        conversation_id: 7,
        reason: 'spam',
        comment: 'details',
      },
      { headers, timeout: 20000 },
    );
  });

  it('passes null conversation and comment through unchanged', async () => {
    axiosInstance.post.mockResolvedValue({});

    await reportUser({
      explorerId: 3,
      reportedExplorerId: 9,
      conversationId: null,
      reason: 'other',
      comment: null,
      headers,
    });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/report/3',
      {
        reported_explorer_id: 9,
        conversation_id: null,
        reason: 'other',
        comment: null,
      },
      { headers, timeout: 20000 },
    );
  });
});
