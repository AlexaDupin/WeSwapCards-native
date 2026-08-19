import { fireEvent, render, screen } from '@testing-library/react-native';

import Hero from '@/src/features/home/components/Hero';

jest.mock('expo-router', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Link: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

const chapters = [
  { id: 1, name: 'Paris', image_url: 'a.jpg' },
  { id: 2, name: 'Lyon', image_url: null },
];

it('shows the confirmed community figures', () => {
  render(<Hero chapters={chapters} onSeeHowItWorks={jest.fn()} />);

  expect(
    screen.getByText('1,000+ collectors joined already · 16,000+ swaps so far'),
  ).toBeTruthy();
});

it('keeps the non-affiliation fineprint under the call to action', () => {
  render(<Hero chapters={chapters} onSeeHowItWorks={jest.fn()} />);

  expect(
    screen.getByText(
      'Free to join. Not affiliated with the official WeWard app.',
    ),
  ).toBeTruthy();
});

it('jumps to How it works when the quiet link is pressed', () => {
  const onSeeHowItWorks = jest.fn();
  render(<Hero chapters={chapters} onSeeHowItWorks={onSeeHowItWorks} />);

  fireEvent.press(screen.getByText('See how it works ↓'));

  expect(onSeeHowItWorks).toHaveBeenCalledTimes(1);
});

it('renders without chapter art while the request is still in flight', () => {
  render(<Hero chapters={[]} onSeeHowItWorks={jest.fn()} />);

  expect(screen.getByText('Create an account')).toBeTruthy();
});
