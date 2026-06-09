import { fireEvent, render, screen } from '@testing-library/react-native';

import OpportunityCard from '@/src/features/swap/components/OpportunityCard';
import { createOpportunity } from '@/src/features/swap/testFixtures';

// ---- Helpers ----

function offeredCards(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    card: { id: i + 1, name: `Card ${i + 1}` },
  }));
}

// ---- Tests ----

describe('OpportunityCard', () => {
  it('caps offered cards at 15 and expands the rest behind the toggle', () => {
    const opportunity = createOpportunity({
      explorer_id: 1,
      opportunities: offeredCards(18),
    });

    render(<OpportunityCard opportunity={opportunity} onContact={jest.fn()} />);

    // Only the first 15 tags render; the 16th is hidden behind the toggle.
    expect(screen.getByText('Card 15')).toBeTruthy();
    expect(screen.queryByText('Card 16')).toBeNull();

    fireEvent.press(screen.getByText('Show 3 more'));

    expect(screen.getByText('Card 16')).toBeTruthy();
    expect(screen.getByText('Card 18')).toBeTruthy();
    expect(screen.getByText('Show less')).toBeTruthy();
  });

  it('shows no toggle when there are 15 or fewer offered cards', () => {
    const opportunity = createOpportunity({
      explorer_id: 1,
      opportunities: offeredCards(3),
    });

    render(<OpportunityCard opportunity={opportunity} onContact={jest.fn()} />);

    expect(screen.getByText('Card 3')).toBeTruthy();
    expect(screen.queryByText(/Show/)).toBeNull();
  });

  it('calls onContact with the opportunity when Contact is pressed', () => {
    const onContact = jest.fn();
    const opportunity = createOpportunity({
      explorer_id: 9,
      explorer_name: 'Bob',
      opportunities: offeredCards(1),
    });

    render(<OpportunityCard opportunity={opportunity} onContact={onContact} />);

    fireEvent.press(screen.getByText('Contact'));

    expect(onContact).toHaveBeenCalledTimes(1);
    expect(onContact).toHaveBeenCalledWith(opportunity);
  });
});
