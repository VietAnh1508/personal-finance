# US-WEB-010: Enable PWA Installability and Offline App Shell

## User Story
As a user,
I want to install and launch the app as a PWA,
so that it feels app-like and remains usable without reliable internet.

## Acceptance Criteria
1. Web manifest is configured with required metadata and icons.
2. Service worker is configured for app-shell caching.
3. App can open offline with cached shell and local data.
4. Basic update strategy is implemented for new deployments.
5. Install prompt/install flow works on supported browsers.
