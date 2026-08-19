import { render, screen } from '@testing-library/react-native';

import ChapterCarousel from '@/src/features/home/components/ChapterCarousel';
import type { ChapterRow } from '@/src/features/home/hooks/useLandingChapters';

// The cards only ever route to sign-up, so the router is a boundary here.
jest.mock('expo-router', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Link: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

const row = (over: Partial<ChapterRow> = {}): ChapterRow => ({
  items: [],
  loading: false,
  error: null,
  ...over,
});

it('renders a card per chapter under the row title', () => {
  render(
    <ChapterCarousel
      title="The latest chapters"
      row={row({
        items: [
          { id: 1, name: 'Paris', image_url: 'a.jpg' },
          { id: 2, name: 'Lyon', image_url: null },
        ],
      })}
    />,
  );

  expect(screen.getByText('The latest chapters')).toBeTruthy();
  expect(screen.getByText('Paris')).toBeTruthy();
  expect(screen.getByText('Lyon')).toBeTruthy();
});

it('shows the error message instead of the list when the row failed', () => {
  render(
    <ChapterCarousel
      title="The latest chapters"
      row={row({ error: 'Unable to load data.' })}
    />,
  );

  expect(screen.getByText('The latest chapters')).toBeTruthy();
  expect(screen.getByText('Unable to load data.')).toBeTruthy();
});

// The regression that matters: an empty vintage row must not leave a heading
// hanging over nothing when the backend has no VINTAGE_COLLECTOR_IDS set.
it('renders nothing at all, title included, when the row loaded empty', () => {
  render(<ChapterCarousel title="Ephemeral vintage series" row={row()} />);

  expect(screen.queryByText('Ephemeral vintage series')).toBeNull();
});

it('keeps the title while the row is still loading', () => {
  render(
    <ChapterCarousel
      title="Ephemeral vintage series"
      row={row({ loading: true })}
    />,
  );

  expect(screen.getByText('Ephemeral vintage series')).toBeTruthy();
});
