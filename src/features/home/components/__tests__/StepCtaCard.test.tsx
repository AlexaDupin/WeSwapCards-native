import { render, screen } from '@testing-library/react-native';

import StepCtaCard from '@/src/features/home/components/StepCtaCard';
import { CTA_CARD_BACKGROUND } from '@/src/features/home/data/ctaCardBackground';

jest.mock('expo-router', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Link: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

it('always uses the one fixed background image', () => {
  render(<StepCtaCard />);

  expect(screen.UNSAFE_getByType('Image' as never).props.source).toBe(
    CTA_CARD_BACKGROUND,
  );
});

it('renders the closing call to action', () => {
  render(<StepCtaCard />);

  expect(
    screen.getByText('Ready to fill the gaps in your collection?'),
  ).toBeTruthy();
  expect(screen.getByText('Create an account')).toBeTruthy();
});
