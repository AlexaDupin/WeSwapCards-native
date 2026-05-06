# WeSwapCards Mobile

Mobile app for [WeSwapCards](https://weswapcards.com), a production card-trading platform used by 965+ members and supporting 15,000+ trades.

Built with **React Native**, **Expo**, and **TypeScript**, this app brings the core WeSwapCards experience to iOS and Android.

<img width="280" alt="WeSwapCards mobile app results" src="https://github.com/user-attachments/assets/b92750c2-ef40-4a2c-abbc-f6bc22bafdc0" />

## Overview

WeSwapCards Mobile allows users to:

- Sign up and sign in securely
- Create their WeSwapCards profile
- Browse and manage their card collection
- Track owned and duplicated cards
- Discover swap opportunities
- View active and past swap conversations
- Send messages to other collectors

The mobile app uses the same production backend as the web platform, keeping user data, conversations, cards, and swap opportunities consistent across both experiences.

## Current Features

- Authentication with Clerk
- Username registration linked to the WeSwapCards database
- Protected tab navigation
- Dashboard for in-progress and past conversations
- Chat with message sending and read tracking
- Card status management: default, owned, duplicated
- Swap discovery by chapter and card
- Conversation status updates: In Progress, Completed, Declined

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Clerk
- Axios
- Jest
- React Native Testing Library

## Project Structure

```txt
app/
├── _layout.tsx
├── index.tsx
├── (auth)/
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── register-user.tsx
├── (tabs)/
│   ├── dashboard.tsx
│   ├── cards.tsx
│   └── swap.tsx
└── (modal)/
    └── chat/
        └── [conversationId].tsx
```

Feature code is organized under `src/features`, with separate folders for auth, dashboard, cards, swap, chat, and shared API logic.

## Testing

The project uses Jest and React Native Testing Library.

Current tests cover:

- Auth hydration flow
- Retry behavior after auth hydration failure
- Dashboard loading and pagination
- Conversation status transitions
- Card status cycling
- Card item rendering and press behavior

## Installation

```bash
git clone https://github.com/AlexaDupin/WeSwapCards-native.git
cd WeSwapCards-native/mobile
npm install
npx expo start
```

## Related Project

- Web app GitHub: [github.com/AlexaDupin/WeSwapCards](https://github.com/AlexaDupin/WeSwapCards)
- Live platform: [weswapcards.com](https://weswapcards.com)

## Contact

For questions or feedback, contact:

contact@weswapcards.com
