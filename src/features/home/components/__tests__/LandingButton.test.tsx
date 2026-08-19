import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import LandingButton from '@/src/features/home/components/LandingButton';
import { Colors } from '@/src/constants/Colors';

// Stands in for expo-router's Link, reproducing the one behavior that matters
// here: `asChild` merges styles through Radix's Slot, whose mergeProps does
// `{ ...slotStyle, ...childStyle }`. Spreading a style *array* through that
// produces `{0:…, 1:…}` and silently drops every style, which is how this
// button once rendered as bare white text with no orange background.
jest.mock('expo-router', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  return {
    Link: ({ children }: { children: React.ReactElement }) => {
      const child = ReactActual.Children.only(children) as React.ReactElement<{
        style?: unknown;
      }>;

      return ReactActual.cloneElement(child, {
        style: Object.assign({}, child.props.style),
      });
    },
  };
});

function backgroundOf(name: string) {
  const style = StyleSheet.flatten(
    screen.getByRole('button', { name }).props.style,
  );
  return (style as { backgroundColor?: string } | undefined)?.backgroundColor;
}

it('survives the Slot style merge and keeps its orange fill', () => {
  render(<LandingButton label="Create an account" href="/sign-up" />);

  expect(backgroundOf('Create an account')).toBe(Colors.primary);
});

it('keeps its fill when the hero glow is applied too', () => {
  render(<LandingButton label="Create an account" href="/sign-up" glow />);

  expect(backgroundOf('Create an account')).toBe(Colors.primary);
});

it('renders the outline variant transparent, not filled', () => {
  render(
    <LandingButton
      label="Explore the catalogue"
      href="/sign-up"
      variant="outline"
    />,
  );

  expect(backgroundOf('Explore the catalogue')).toBeUndefined();
  expect(screen.getByText('Explore the catalogue')).toBeTruthy();
});
