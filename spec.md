# Advocate Diary

## Current State
App uses Internet Identity (blockchain) for authentication. After login, users can manage legal cases. LoginScreen shows a single "Login to Continue" button that triggers Internet Identity.

## Requested Changes (Diff)

### Add
- Sign Up page: form with Login ID (username) and Password fields, confirm password field, submit button
- Login page update: form with Login ID and Password fields instead of just Internet Identity button
- Backend: store user credentials (loginId + hashed password) per principal
- Backend: `signUp(loginId, password)` - registers credentials for current principal
- Backend: `verifyCredentials(loginId, password)` - verifies login ID and password match the principal
- Backend: `hasCredentials()` - checks if current principal has set up credentials

### Modify
- LoginScreen: replace single button with a tabbed interface (Login / Sign Up) with login ID + password fields
- App.tsx: after Internet Identity auth, check if user has credentials; if not, show signup; if yes, show credential login form

### Remove
- Nothing removed

## Implementation Plan
1. Update backend (main.mo) to add credential storage and verification functions
2. Update backend.d.ts with new function signatures
3. Create SignupPage component with login ID, password, confirm password fields
4. Update LoginScreen to show login ID + password form after Internet Identity auth
5. Update App.tsx to handle the two-step auth flow (II auth -> credential check -> signup or login)
