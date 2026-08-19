import { renderHook, waitFor } from '@testing-library/react-native';

import { useLandingChapters } from '@/src/features/home/hooks/useLandingChapters';

// Mock only the network boundary, so the real api functions and their response
// unwrapping stay under test.
jest.mock('@/src/lib/axiosInstance', () => ({
  axiosInstance: { get: jest.fn() },
}));

const { axiosInstance } = jest.requireMock('@/src/lib/axiosInstance') as {
  axiosInstance: { get: jest.Mock };
};

const LATEST = [{ id: 1, name: 'Paris', image_url: 'a.jpg' }];
const VINTAGE = [{ id: 9, name: 'Retro', image_url: null }];

/** Routes each mocked GET by URL, since both fire in parallel. */
function mockEndpoints(handlers: Record<string, () => Promise<unknown>>) {
  axiosInstance.get.mockImplementation((url: string) => {
    const handler = handlers[url];
    if (!handler) throw new Error(`unexpected GET ${url}`);
    return handler();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

it('loads both rows and asks for the latest chapters once', async () => {
  mockEndpoints({
    '/chapters/latest': () => Promise.resolve({ data: { items: LATEST } }),
    '/chapters/vintage': () => Promise.resolve({ data: { items: VINTAGE } }),
  });

  const { result } = renderHook(() => useLandingChapters());

  expect(result.current.latest.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.latest.loading).toBe(false);
    expect(result.current.vintage.loading).toBe(false);
  });

  expect(result.current.latest.items).toEqual(LATEST);
  expect(result.current.vintage.items).toEqual(VINTAGE);
  expect(result.current.latest.error).toBeNull();

  // The hero art and the first carousel share one request.
  const latestCalls = axiosInstance.get.mock.calls.filter(
    ([url]) => url === '/chapters/latest',
  );
  expect(latestCalls).toHaveLength(1);
});

it('keeps one row usable when the other request fails', async () => {
  mockEndpoints({
    '/chapters/latest': () => Promise.resolve({ data: { items: LATEST } }),
    '/chapters/vintage': () => Promise.reject(new Error('boom')),
  });

  const { result } = renderHook(() => useLandingChapters());

  await waitFor(() => {
    expect(result.current.vintage.loading).toBe(false);
  });

  expect(result.current.vintage.error).toBe('Unable to load data.');
  expect(result.current.vintage.items).toEqual([]);

  await waitFor(() => {
    expect(result.current.latest.items).toEqual(LATEST);
  });
  expect(result.current.latest.error).toBeNull();
});

it('treats an empty vintage list as a successful load, not an error', async () => {
  mockEndpoints({
    '/chapters/latest': () => Promise.resolve({ data: { items: LATEST } }),
    '/chapters/vintage': () => Promise.resolve({ data: { items: [] } }),
  });

  const { result } = renderHook(() => useLandingChapters());

  await waitFor(() => {
    expect(result.current.vintage.loading).toBe(false);
  });

  expect(result.current.vintage.items).toEqual([]);
  expect(result.current.vintage.error).toBeNull();
});

it('fetches nothing while disabled, for a visitor about to be redirected', () => {
  mockEndpoints({
    '/chapters/latest': () => Promise.resolve({ data: { items: LATEST } }),
    '/chapters/vintage': () => Promise.resolve({ data: { items: VINTAGE } }),
  });

  renderHook(() => useLandingChapters(false));

  expect(axiosInstance.get).not.toHaveBeenCalled();
});

it('does not set state after unmounting', async () => {
  let resolveLatest: (value: unknown) => void = () => {};

  mockEndpoints({
    '/chapters/latest': () =>
      new Promise((resolve) => {
        resolveLatest = resolve;
      }),
    '/chapters/vintage': () => Promise.resolve({ data: { items: [] } }),
  });

  const { unmount } = renderHook(() => useLandingChapters());
  unmount();

  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  resolveLatest({ data: { items: LATEST } });
  await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());

  expect(warn).not.toHaveBeenCalled();
});
