export type StepTone = 'accent' | 'teal';

export type HowItWorksStep = {
  title: string;
  text: string;
  /**
   * Steps 1 to 3 are the solo tracking loop; 4 and 5 are the two-person swap
   * loop. The colour change marks where another collector enters, so it is not
   * decoration.
   */
  tone: StepTone;
};

// Copy is kept in step with the web landing page's STEPS array
// (front/src/components/Home/Home.jsx).
export const howItWorksSteps: readonly HowItWorksStep[] = [
  {
    title: 'Log all the cards you have',
    text: 'Mark owned, missing, and duplicate cards across every chapter in a couple of taps.',
    tone: 'accent',
  },
  {
    title: 'Find the card you need',
    text: 'Search any card and see instantly who has a spare copy sitting in their collection.',
    tone: 'accent',
  },
  {
    title: 'Browse users who have it',
    text: 'Collectors who also need one of your duplicates come first.',
    tone: 'accent',
  },
  {
    title: 'Chat with them and find a deal',
    text: 'Negotiate directly in the app until both sides are happy with the swap.',
    tone: 'teal',
  },
  {
    title: 'Keep track in a dashboard',
    text: 'Every request, pending trade, and completed swap in one place.',
    tone: 'teal',
  },
];
