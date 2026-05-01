# Job Finder App

A React Native job finder application built with Expo. The app allows users to sign in, browse paginated job listings, search by company, view job details, apply to jobs, manage applied jobs, and update their profile information.

## Features

- Authentication with login and register screens
- Persistent session storage with Expo SecureStore
- Paginated job listing with infinite scroll
- Company-based job search
- Job detail screen with company, location, salary, description, date, and keywords
- Apply and withdraw application flow
- Applied jobs list with persistent local storage
- Profile screen with editable user information
- Profile image preview with fallback image handling
- Date of birth selection with an in-app calendar modal
- Turkish phone number formatting, for example `507 585 40 33`
- Logout confirmation modal

## Tech Stack

- React Native
- Expo
- Expo Router
- Redux Toolkit
- React Redux
- Axios
- React Hook Form
- Expo SecureStore
- Expo Image
- React Native Size Matters

## API

The app uses the SHFT Job Finder API:

```txt
https://novel-project-ntj8t.ampt.app/api
```

Authenticated requests use the access token returned by the login/register endpoints.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Run on a platform:

```bash
npm run ios
npm run android
npm run web
```

## Scripts

```bash
npm run start
npm run ios
npm run android
npm run web
npm run lint
```

## Project Structure

```txt
app/
  (auth)/          Login and register screens
  (tabs)/          Main tab screens
  job/[id].tsx     Job detail screen
src/
  api/             Axios API clients
  components/      Shared UI components
  store/           Redux store and slices
  theme/           Colors and spacing helpers
  types/           Shared TypeScript types
```

## Main Screens

- `Job Listings`: Browse and search jobs with paginated loading.
- `Job Detail`: View details and apply or withdraw.
- `Applied Jobs`: View jobs the user has applied to.
- `Profile`: Edit profile information and sign out.

## Persistence

- User session is stored securely with `expo-secure-store`.
- Applied jobs are also persisted locally so they remain after app refresh/reload.

## Validation

The project was checked with:

```bash
npx tsc --noEmit
npm run lint
```

## Notes

- The app does not require an `.env` file because the API base URL is defined in `src/api/client.ts`.
- If a previously stored token expires or becomes invalid, sign out and sign in again to refresh the session.
