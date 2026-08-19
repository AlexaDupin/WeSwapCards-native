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
        totalOpportunities={0}
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

  it('leads the section heading with the total number of results', () => {
    render(
      <OpportunityList
        selectedCardId={5}
        selectedCardName="Card 5"
        opportunities={[]}
        totalOpportunities={12}
        loadingOpportunities={false}
        loadingMoreOpportunities={false}
        onLoadMore={jest.fn()}
        onContact={jest.fn()}
      />,
    );

    expect(screen.getByText('12 opportunities for')).toBeTruthy();
  });

  it('keeps the plain heading while the first page is still loading', () => {
    render(
      <OpportunityList
        selectedCardId={5}
        selectedCardName="Card 5"
        opportunities={[]}
        totalOpportunities={null}
        loadingOpportunities
        loadingMoreOpportunities={false}
        onLoadMore={jest.fn()}
        onContact={jest.fn()}
      />,
    );

    expect(screen.getByText('Opportunities for')).toBeTruthy();
  });
});
