import { render } from '@testing-library/react-native';
import { ScrollView } from 'react-native';

import LatestChaptersMiniTiles from '@/src/features/swap/components/LatestChaptersMiniTiles';

// These tests cover only the auto-scroll useLayoutEffect — the one piece of
// real logic in this otherwise presentational component. The offset math
// (index * (TILE_WIDTH + TILE_GAP) = index * 94) and the `index <= 0` guard
// (skip when the selection is missing or is already the first tile) are what
// can regress silently, so they are pinned here.

const chapters = [
  { id: 1, name: 'Chapter 1' },
  { id: 2, name: 'Chapter 2' },
  { id: 3, name: 'Chapter 3' },
];

function renderTiles(selectedChapterId: number | null) {
  return render(
    <LatestChaptersMiniTiles
      chapters={chapters}
      loading={false}
      selectedChapterId={selectedChapterId}
      onSelectChapter={jest.fn()}
    />,
  );
}

describe('LatestChaptersMiniTiles auto-scroll', () => {
  let scrollTo: jest.SpyInstance;

  beforeEach(() => {
    scrollTo = jest
      .spyOn(ScrollView.prototype, 'scrollTo')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  it('scrolls to the selected tile using the tile width + gap offset', () => {
    renderTiles(3); // index 2 -> 2 * (82 + 12) = 188

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ x: 188, animated: false });
  });

  it('does not scroll when the first tile is selected (index 0)', () => {
    renderTiles(1);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('does not scroll when the selected id is not in the list', () => {
    renderTiles(999);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('does not scroll when nothing is selected', () => {
    renderTiles(null);

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
