# US-WEB-012: Decommission React Native/Expo App and Complete PWA Cutover

## User Story
As a product owner,
I want the React Native/Expo app removed from active delivery,
so that the React PWA is the single maintained client platform.

## Acceptance Criteria
1. A cutover checklist is documented and approved for moving to PWA-only delivery.
2. React Native/Expo app entry points and build scripts are removed or archived with clear guidance.
3. React Native-only dependencies are removed from active project manifests and lockfiles.
4. CI/CD and project documentation are updated to reference web/PWA workflows as the default.
5. Legacy mobile app deprecation/rollback notes are documented for operational safety.
