/**
 * Re-render benchmark for the cards screen.
 *
 * Faithfully reproduces the wiring of CardItem / ChapterSection / ChaptersList
 * (React.memo + callback identity), but swaps the native host components
 * (gesture-handler, RN View/Text) for plain test hosts so it runs in Node.
 *
 * It counts how many CardItem component bodies actually execute when a SINGLE
 * card's status is toggled — the exact work the VirtualizedList warning flagged.
 *
 * Run: node scripts/bench-card-rerenders.js
 */
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const { useState, useRef, useEffect, useCallback, memo } = React;
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

const CHAPTERS = 40;
const CARDS_PER_CHAPTER = 9;

// Shared test data: 40 chapters x 9 cards = 360 cards.
function makeChapters() {
  const chapters = [];
  let id = 1;
  for (let c = 0; c < CHAPTERS; c++) {
    const cards = [];
    for (let n = 0; n < CARDS_PER_CHAPTER; n++) {
      cards.push({ id: id++, number: n + 1, place_id: c });
    }
    chapters.push({ chapterId: c, chapterName: `Chapter ${c}`, cards });
  }
  return chapters;
}

let cardRenderCount = 0;

// ---------------------------------------------------------------------------
// BEFORE: memo defeated by inline callbacks + unstable hook callback
// ---------------------------------------------------------------------------
const CardItemBefore = memo(function CardItem({ item, status, onSelect }) {
  cardRenderCount++;
  return React.createElement('view', { 'data-status': status });
});

function ChapterSectionBefore({ cards, statuses, onSelectCard }) {
  return React.createElement(
    'view',
    null,
    cards.map((card) =>
      React.createElement(CardItemBefore, {
        key: card.id,
        item: card,
        status: statuses[card.id] || 'default',
        // new closure every render -> breaks React.memo
        onSelect: () => onSelectCard(card.id),
      }),
    ),
  );
}

function ScreenBefore({ chapters, onReady }) {
  const [statuses, setStatuses] = useState({});
  // depends on `statuses` -> new identity on every toggle
  const onSelectCard = useCallback(
    (id) => setStatuses((prev) => ({ ...prev, [id]: 'owned' })),
    [statuses],
  );
  useEffect(() => onReady(onSelectCard), [onSelectCard, onReady]);
  return React.createElement(
    'view',
    null,
    chapters.map((ch) =>
      React.createElement(ChapterSectionBefore, {
        key: ch.chapterId,
        cards: ch.cards,
        statuses,
        onSelectCard,
      }),
    ),
  );
}

// ---------------------------------------------------------------------------
// AFTER: stable callbacks (ref) + memoized section + direct callback pass
// ---------------------------------------------------------------------------
const CardItemAfter = memo(function CardItem({ item, status, onSelect }) {
  cardRenderCount++;
  return React.createElement('view', { 'data-status': status });
});

const ChapterSectionAfter = memo(function ChapterSection({
  cards,
  statuses,
  onSelectCard,
}) {
  return React.createElement(
    'view',
    null,
    cards.map((card) =>
      React.createElement(CardItemAfter, {
        key: card.id,
        item: card,
        status: statuses[card.id] || 'default',
        onSelect: onSelectCard, // stable ref
      }),
    ),
  );
});

function ScreenAfter({ chapters, onReady }) {
  const [statuses, setStatuses] = useState({});
  const statusesRef = useRef(statuses);
  useEffect(() => {
    statusesRef.current = statuses;
  }, [statuses]);
  // stable identity for the lifetime of the screen
  const onSelectCard = useCallback(
    (id) => setStatuses((prev) => ({ ...prev, [id]: 'owned' })),
    [],
  );
  useEffect(() => onReady(onSelectCard), [onSelectCard, onReady]);
  return React.createElement(
    'view',
    null,
    chapters.map((ch) =>
      React.createElement(ChapterSectionAfter, {
        key: ch.chapterId,
        cards: ch.cards,
        statuses,
        onSelectCard,
      }),
    ),
  );
}

function measure(Screen, label) {
  const chapters = makeChapters();
  let toggle;
  cardRenderCount = 0;

  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      React.createElement(Screen, {
        chapters,
        onReady: (fn) => {
          toggle = fn;
        },
      }),
    );
  });

  const initial = cardRenderCount;
  cardRenderCount = 0;

  // Toggle ONE card in the first chapter.
  act(() => {
    toggle(1);
  });

  const onToggle = cardRenderCount;
  renderer.unmount();

  console.log(
    `${label.padEnd(8)} | initial mount: ${String(initial).padStart(
      4,
    )} CardItem renders | toggle 1 card: ${String(onToggle).padStart(
      4,
    )} CardItem re-renders`,
  );
  return onToggle;
}

console.log(
  `\nCards screen: ${CHAPTERS} chapters x ${CARDS_PER_CHAPTER} cards = ${
    CHAPTERS * CARDS_PER_CHAPTER
  } cards total\n`,
);
const before = measure(ScreenBefore, 'BEFORE');
const after = measure(ScreenAfter, 'AFTER');
console.log(
  `\nToggling one card re-rendered ${before} CardItems before, ${after} after` +
    ` — a ${(before / after).toFixed(0)}x reduction.\n`,
);
