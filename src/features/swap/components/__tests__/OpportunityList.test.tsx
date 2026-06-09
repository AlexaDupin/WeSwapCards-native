import { render, screen } from '@testing-library/react-native';

import OpportunityList from '@/src/features/swap/components/OpportunityList';

// ---- Tests ----

describe('OpportunityList', () => {
  it('renders the empty state with the card name when a card has no swap partners', () => {
    render(
      <OpportunityList
        selectedCardId={5}
        selectedCardName="Card 5"
        opportunities={[]}
        loadingOpportunities={false}
        loadingMoreOpportunities={false}
        onLoadMore={jest.fn()}
        onContact={jest.fn()}
      />,
    );

    expect(screen.getByText('No swap partners yet')).toBeTruthy();
    // Card name appears in the section header and again in the empty message.
    expect(screen.getAllByText('Card 5').length).toBeGreaterThan(0);
  });
});
