import {
  createConversation,
  fetchOfferableCards,
  getAllMessages,
  getConversation,
  markConversationRead,
  postMessage,
  updateConversationStatus,
} from '@/src/features/chat/api/chatApi';

// Mock only the network boundary. These tests lock down the request contract
// (URL + body + headers) and the response unwrapping the hook relies on —
// notably getConversation's 204 -> null branch and the encodeURIComponent of
// card names in conversation URLs.
jest.mock('@/src/lib/axiosInstance', () => ({
  axiosInstance: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const { axiosInstance } = jest.requireMock('@/src/lib/axiosInstance') as {
  axiosInstance: { get: jest.Mock; post: jest.Mock; put: jest.Mock };
};

const headers = { Authorization: 'Bearer t' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getAllMessages', () => {
  it('requests /chat/:id and unwraps messages + status', async () => {
    const allMessages = [{ id: 1, content: 'hi' }];
    axiosInstance.get.mockResolvedValue({
      data: { allMessages, conversationStatus: 'In progress' },
    });

    await expect(getAllMessages({ conversationId: 7, headers })).resolves.toEqual(
      { allMessages, conversationStatus: 'In progress' },
    );
    expect(axiosInstance.get).toHaveBeenCalledWith('/chat/7', {
      headers,
      timeout: 20000,
    });
  });

  it('falls back to [] messages and null status when absent', async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await expect(
      getAllMessages({ conversationId: 7, headers }),
    ).resolves.toEqual({ allMessages: [], conversationStatus: null });
  });
});

describe('markConversationRead', () => {
  it('PUTs an empty body to /conversation/:id/:explorerId', async () => {
    axiosInstance.put.mockResolvedValue({});

    await markConversationRead({ conversationId: 7, explorerId: 3, headers });

    expect(axiosInstance.put).toHaveBeenCalledWith(
      '/conversation/7/3',
      {},
      { headers, timeout: 20000 },
    );
  });
});

describe('postMessage', () => {
  it('POSTs the payload to /chat/:id', async () => {
    axiosInstance.post.mockResolvedValue({});
    const payload = {
      content: 'hi',
      timestamp: '2026-06-10T12:00:00.000Z',
      sender_id: 3,
      recipient_id: 9,
      conversation_id: 7,
    };

    await postMessage({ conversationId: 7, headers, payload });

    expect(axiosInstance.post).toHaveBeenCalledWith('/chat/7', payload, {
      headers,
      timeout: 20000,
    });
  });
});

describe('updateConversationStatus', () => {
  it('PUTs the status to /conversation/:id', async () => {
    axiosInstance.put.mockResolvedValue({});

    await updateConversationStatus({
      conversationId: 7,
      headers,
      status: 'Completed',
    });

    expect(axiosInstance.put).toHaveBeenCalledWith(
      '/conversation/7',
      { status: 'Completed' },
      { headers, timeout: 20000 },
    );
  });
});

describe('fetchOfferableCards', () => {
  it('requests the opportunities endpoint and unwraps the array', async () => {
    const items = [{ card: { id: 2, name: 'Card B' } }];
    axiosInstance.get.mockResolvedValue({ data: items });

    await expect(
      fetchOfferableCards({
        conversationId: 7,
        creatorId: 3,
        recipientId: 9,
        headers,
      }),
    ).resolves.toEqual(items);
    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/conversation/7/opportunities/3/9',
      { headers, timeout: 20000 },
    );
  });

  it('falls back to [] when data is absent', async () => {
    axiosInstance.get.mockResolvedValue({ data: null });

    await expect(
      fetchOfferableCards({
        conversationId: 7,
        creatorId: 3,
        recipientId: 9,
        headers,
      }),
    ).resolves.toEqual([]);
  });
});

describe('getConversation', () => {
  it('returns the row and URL-encodes the card name', async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: { id: 42 } });

    await expect(
      getConversation({
        explorerId: 3,
        swapExplorerId: 9,
        cardName: 'Card #5 / Foo',
        headers,
      }),
    ).resolves.toEqual({ id: 42 });
    expect(axiosInstance.get).toHaveBeenCalledWith(
      `/conversation/3/9/${encodeURIComponent('Card #5 / Foo')}`,
      { headers, timeout: 20000 },
    );
  });

  it('returns null on 204 (no conversation yet)', async () => {
    axiosInstance.get.mockResolvedValue({ status: 204, data: '' });

    await expect(
      getConversation({
        explorerId: 3,
        swapExplorerId: 9,
        cardName: 'Card 5',
        headers,
      }),
    ).resolves.toBeNull();
  });

  it('returns null when the body is empty even on a 200', async () => {
    axiosInstance.get.mockResolvedValue({ status: 200, data: null });

    await expect(
      getConversation({
        explorerId: 3,
        swapExplorerId: 9,
        cardName: 'Card 5',
        headers,
      }),
    ).resolves.toBeNull();
  });
});

describe('createConversation', () => {
  it('POSTs the creator/recipient/card payload to the encoded URL', async () => {
    axiosInstance.post.mockResolvedValue({ data: { id: 100 } });

    await expect(
      createConversation({
        explorerId: 3,
        swapExplorerId: 9,
        cardName: 'Card #5 / Foo',
        headers,
      }),
    ).resolves.toEqual({ id: 100 });

    expect(axiosInstance.post).toHaveBeenCalledWith(
      `/conversation/3/9/${encodeURIComponent('Card #5 / Foo')}`,
      expect.objectContaining({
        creator_id: 3,
        recipient_id: 9,
        card_name: 'Card #5 / Foo',
        timestamp: expect.any(String),
      }),
      { headers, timeout: 20000 },
    );
  });
});
