import { fireEvent, render, screen } from '@testing-library/react-native';

import ChapterSelector from '@/src/features/swap/components/ChapterSelector';
import { createChapter } from '@/src/features/swap/testFixtures';

// ---- Helpers ----

const chapters = [
  createChapter({ id: 1, name: 'Chapter 1' }),
  createChapter({ id: 2, name: 'Chapter 2' }),
];

// ---- Tests ----

describe('ChapterSelector', () => {
  it('opens the dropdown and reports the chosen chapter', () => {
    const onSelectChapter = jest.fn();
    render(
      <ChapterSelector
        chapters={chapters}
        selectedChapterId={null}
        selectedChapterName={null}
        loading={false}
        onSelectChapter={onSelectChapter}
      />,
    );

    // Items are hidden until the selector is opened.
    expect(screen.queryByText('Chapter 2')).toBeNull();

    fireEvent.press(screen.getByLabelText('Select a chapter'));

    expect(screen.getByText('Chapter 1')).toBeTruthy();
    fireEvent.press(screen.getByText('Chapter 2'));

    expect(onSelectChapter).toHaveBeenCalledWith(2);
  });

  it('closes the list when the scrim behind it is tapped', () => {
    render(
      <ChapterSelector
        chapters={chapters}
        selectedChapterId={null}
        selectedChapterName={null}
        loading={false}
        onSelectChapter={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Select a chapter'));
    expect(screen.getByText('Chapter 2')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Close the chapter list'));

    expect(screen.queryByText('Chapter 2')).toBeNull();
  });

  it('disables Clear when no chapter is selected', () => {
    render(
      <ChapterSelector
        chapters={chapters}
        selectedChapterId={null}
        selectedChapterName={null}
        loading={false}
        onSelectChapter={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Clear chapter selection')).toBeDisabled();
  });

  it('clears the selection when a chapter is selected', () => {
    const onSelectChapter = jest.fn();
    render(
      <ChapterSelector
        chapters={chapters}
        selectedChapterId={1}
        selectedChapterName="Chapter 1"
        loading={false}
        onSelectChapter={onSelectChapter}
      />,
    );

    fireEvent.press(screen.getByLabelText('Clear chapter selection'));

    expect(onSelectChapter).toHaveBeenCalledWith(null);
  });
});
