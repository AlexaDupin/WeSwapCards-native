// Content for the first-launch onboarding carousel, one entry per slide.
// The PNGs share a baked-in cream background (Colors.onboardingBackground)
// so they blend seamlessly into the screen.
export type OnboardingSlide = {
  key: string;
  image: number;
  headline: string;
  body: string;
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    key: 'collect',
    image: require('@/src/assets/images/illustrations/onboarding-collect.png'),
    headline: 'Log all your cards',
    body: 'To start, mark the cards you own and your duplicates. It takes just a few taps.',
  },
  {
    key: 'swap',
    image: require('@/src/assets/images/illustrations/onboarding-swap.png'),
    headline: 'Search for your missing cards',
    body: 'Pick a card to see who has it and who needs your duplicates.',
  },
  {
    key: 'chat',
    image: require('@/src/assets/images/illustrations/onboarding-chat.png'),
    headline: 'Chat and swap',
    body: 'Send a message to other collectors and agree on your swaps. More than 16,000 swaps so far!',
  },
  {
    key: 'update',
    image: require('@/src/assets/images/illustrations/onboarding-update.png'),
    headline: 'Keep your cards up to date',
    body: 'Update your cards often, so other collectors always see what you have. Happy swaps!',
  },
];
